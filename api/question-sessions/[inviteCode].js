import {
  applyCors,
  findParticipantByToken,
  getInviteCode,
  getSupabaseClient,
  jsonError,
  loadSessionBundle,
  serializeSession,
} from "../_questionSessions.js";

export default async function handler(request, response) {
  applyCors(request, response, "GET, DELETE, OPTIONS");

  if (request.method === "OPTIONS") return response.status(204).end();
  if (!["GET", "DELETE"].includes(request.method)) {
    response.setHeader("Allow", "GET, DELETE, OPTIONS");
    return jsonError(response, 405, "허용되지 않는 요청입니다.");
  }

  try {
    const inviteCode = String(getInviteCode(request) ?? "").trim();
    if (!inviteCode) return jsonError(response, 404, "초대 링크를 찾을 수 없어요.");

    const supabase = getSupabaseClient();
    const bundle = await loadSessionBundle(supabase, inviteCode);

    if (!bundle.session) {
      return jsonError(response, 404, "존재하지 않거나 삭제된 문답이에요.");
    }
    if (bundle.error) throw bundle.error;

    const token =
      request.method === "GET"
        ? request.query?.token
        : request.body?.participantToken;
    const participant = findParticipantByToken(bundle.participants, token);

    if (request.method === "DELETE") {
      if (!participant) return jsonError(response, 403, "문답을 삭제할 권한을 확인하지 못했어요.");

      const { error } = await supabase
        .from("question_sessions")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", bundle.session.id)
        .is("deleted_at", null);

      if (error) throw error;

      return response.status(200).json({ ok: true });
    }

    return response.status(200).json({
      ok: true,
      session: serializeSession({ ...bundle, participant }),
    });
  } catch (error) {
    console.error("question session load failed", {
      message: error?.message,
      code: error?.code,
    });

    return jsonError(response, 500, "문답 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}
