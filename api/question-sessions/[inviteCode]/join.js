// Together Questions 초대받은 사람의 참여를 등록하는 API입니다.
import {
  ROLES,
  applyCors,
  findParticipantByToken,
  generateToken,
  getInviteCode,
  getSupabaseClient,
  hashToken,
  jsonError,
  loadSessionBundle,
  serializeSession,
  validateDisplayName,
} from "../../_questionSessions.js";

export default async function handler(request, response) {
  applyCors(request, response, "POST, OPTIONS");

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return jsonError(response, 405, "허용되지 않는 요청입니다.");
  }

  try {
    const inviteCode = getInviteCode(request);
    const nameResult = validateDisplayName(request.body?.displayName);

    if (!inviteCode) return jsonError(response, 404, "초대 링크를 찾을 수 없어요.");
    if (!nameResult.ok) return jsonError(response, 400, nameResult.error);

    const supabase = getSupabaseClient();
    const bundle = await loadSessionBundle(supabase, inviteCode);

    if (!bundle.session) return jsonError(response, 404, "존재하지 않거나 삭제된 문답이에요.");
    if (bundle.error) throw bundle.error;

    if (bundle.session.expires_at && new Date(bundle.session.expires_at).getTime() < Date.now()) {
      return jsonError(response, 410, "초대 링크가 만료됐어요. 새 문답을 시작해 주세요.");
    }

    const existingInvitee = bundle.participants.find((item) => item.role === ROLES.INVITEE);
    const providedParticipant = findParticipantByToken(
      bundle.participants,
      request.body?.participantToken
    );

    if (existingInvitee && providedParticipant?.id === existingInvitee.id) {
      return response.status(200).json({
        ok: true,
        session: serializeSession({ ...bundle, participant: providedParticipant }),
        participantToken: request.body.participantToken,
      });
    }

    if (existingInvitee) {
      return jsonError(response, 409, "이미 초대받은 사람이 참여한 문답이에요.");
    }

    const participantToken = generateToken(32);
    const { data: participant, error: participantError } = await supabase
      .from("question_participants")
      .insert({
        session_id: bundle.session.id,
        role: ROLES.INVITEE,
        display_name: nameResult.displayName,
        access_token_hash: hashToken(participantToken),
      })
      .select("*")
      .single();

    if (participantError) throw participantError;

    const { error: updateError } = await supabase
      .from("question_sessions")
      .update({ invitee_participant_id: participant.id })
      .eq("id", bundle.session.id);

    if (updateError) throw updateError;

    return response.status(201).json({
      ok: true,
      session: serializeSession({
        session: bundle.session,
        participants: [...bundle.participants, participant],
        answers: bundle.answers,
        participant,
      }),
      participantToken,
    });
  } catch (error) {
    console.error("question session join failed", {
      message: error?.message,
      code: error?.code,
    });

    return jsonError(response, 500, "참여 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}
