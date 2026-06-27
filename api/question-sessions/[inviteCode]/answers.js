import {
  LIMITS,
  SESSION_STATUS,
  applyCors,
  cleanAnswer,
  findParticipantByToken,
  getInviteCode,
  getSupabaseClient,
  jsonError,
  loadSessionBundle,
  serializeSession,
} from "../../_questionSessions.js";

export default async function handler(request, response) {
  applyCors(request, response, "PATCH, OPTIONS");

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH, OPTIONS");
    return jsonError(response, 405, "허용되지 않는 요청입니다.");
  }

  try {
    const inviteCode = getInviteCode(request);
    const { participantToken, answers = {}, submit = false } = request.body ?? {};

    if (!inviteCode) return jsonError(response, 404, "초대 링크를 찾을 수 없어요.");
    if (!participantToken) return jsonError(response, 403, "참여자 권한을 확인하지 못했어요.");
    if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
      return jsonError(response, 400, "답변 형식이 올바르지 않아요.");
    }

    const answerEntries = Object.entries(answers).slice(0, LIMITS.answersPerSubmit);
    const supabase = getSupabaseClient();
    const bundle = await loadSessionBundle(supabase, inviteCode);

    if (!bundle.session) return jsonError(response, 404, "존재하지 않거나 삭제된 문답이에요.");
    if (bundle.error) throw bundle.error;
    if (bundle.session.expires_at && new Date(bundle.session.expires_at).getTime() < Date.now()) {
      return jsonError(response, 410, "초대 링크가 만료됐어요. 새 문답을 시작해 주세요.");
    }
    if (bundle.session.completed_at) {
      return jsonError(response, 409, "이미 완료된 문답은 수정할 수 없어요.");
    }

    const participant = findParticipantByToken(bundle.participants, participantToken);
    if (!participant) return jsonError(response, 403, "참여자 권한을 확인하지 못했어요.");
    if (participant.submitted_at) {
      return jsonError(response, 409, "이미 제출한 답변은 수정할 수 없어요.");
    }

    if (answerEntries.length) {
      const rows = answerEntries.map(([questionId, answer]) => ({
        session_id: bundle.session.id,
        participant_id: participant.id,
        question_id: cleanAnswer(questionId).slice(0, 80),
        answer: cleanAnswer(answer),
      }));

      const { error: upsertError } = await supabase
        .from("question_answers")
        .upsert(rows, { onConflict: "participant_id,question_id" });

      if (upsertError) throw upsertError;
    }

    let nextParticipant = participant;
    let nextSession = bundle.session;

    if (submit) {
      const submittedAt = new Date().toISOString();
      const { data: submittedParticipant, error: submitError } = await supabase
        .from("question_participants")
        .update({ submitted_at: submittedAt })
        .eq("id", participant.id)
        .is("submitted_at", null)
        .select("*")
        .single();

      if (submitError) throw submitError;
      nextParticipant = submittedParticipant;

      const participantsAfterSubmit = bundle.participants.map((item) =>
        item.id === submittedParticipant.id ? submittedParticipant : item
      );
      const bothSubmitted = participantsAfterSubmit.every((item) => item.submitted_at);

      if (bothSubmitted && participantsAfterSubmit.length >= 2) {
        const { data: completedSession, error: completeError } = await supabase
          .from("question_sessions")
          .update({
            status: SESSION_STATUS.COMPLETED,
            completed_at: submittedAt,
          })
          .eq("id", bundle.session.id)
          .is("completed_at", null)
          .select("*")
          .single();

        if (completeError) throw completeError;
        nextSession = completedSession;
      }
    }

    const refreshed = await loadSessionBundle(supabase, inviteCode);
    if (refreshed.error) throw refreshed.error;

    return response.status(200).json({
      ok: true,
      session: serializeSession({
        session: refreshed.session ?? nextSession,
        participants: refreshed.participants,
        answers: refreshed.answers,
        participant: refreshed.participants.find((item) => item.id === nextParticipant.id),
      }),
    });
  } catch (error) {
    console.error("question answers save failed", {
      message: error?.message,
      code: error?.code,
    });

    return jsonError(response, 500, "답변을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}
