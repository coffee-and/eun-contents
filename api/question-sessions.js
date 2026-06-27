import {
  ROLES,
  SESSION_STATUS,
  applyCors,
  generateToken,
  getSupabaseClient,
  hashToken,
  jsonError,
  validateDisplayName,
} from "./_questionSessions.js";

const VALID_RELATIONSHIP_TYPES = new Set(["couple", "married", "family", "friends"]);
const VALID_QUESTION_PACKS = new Set(["light", "honest", "memory-future"]);

export default async function handler(request, response) {
  applyCors(request, response, "POST, OPTIONS");

  if (request.method === "OPTIONS") return response.status(204).end();

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return jsonError(response, 405, "허용되지 않는 요청입니다.");
  }

  try {
    const { displayName: rawName, relationshipType, questionPackId } = request.body ?? {};
    const nameResult = validateDisplayName(rawName);

    if (!nameResult.ok) return jsonError(response, 400, nameResult.error);
    if (!VALID_RELATIONSHIP_TYPES.has(relationshipType)) {
      return jsonError(response, 400, "상대와의 관계를 다시 선택해 주세요.");
    }
    if (!VALID_QUESTION_PACKS.has(questionPackId)) {
      return jsonError(response, 400, "질문 주제를 다시 선택해 주세요.");
    }

    const supabase = getSupabaseClient();
    const inviteCode = generateToken(24);
    const participantToken = generateToken(32);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    const { data: session, error: sessionError } = await supabase
      .from("question_sessions")
      .insert({
        public_token: inviteCode,
        relationship_type: relationshipType,
        question_pack_id: questionPackId,
        status: SESSION_STATUS.WAITING,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (sessionError) throw sessionError;

    const { data: participant, error: participantError } = await supabase
      .from("question_participants")
      .insert({
        session_id: session.id,
        role: ROLES.CREATOR,
        display_name: nameResult.displayName,
        access_token_hash: hashToken(participantToken),
      })
      .select("*")
      .single();

    if (participantError) throw participantError;

    const { error: updateError } = await supabase
      .from("question_sessions")
      .update({ creator_participant_id: participant.id })
      .eq("id", session.id);

    if (updateError) throw updateError;

    return response.status(201).json({
      ok: true,
      session: {
        id: session.id,
        inviteCode,
        relationshipType,
        questionPackId,
        status: SESSION_STATUS.WAITING,
        expiresAt,
        participants: {
          creator: { displayName: nameResult.displayName, submittedAt: null },
          invitee: null,
        },
        participant: {
          role: ROLES.CREATOR,
          displayName: nameResult.displayName,
          submittedAt: null,
        },
        answers: [],
      },
      participantToken,
    });
  } catch (error) {
    console.error("question session create failed", {
      message: error?.message,
      code: error?.code,
    });

    return jsonError(response, 500, "문답을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}
