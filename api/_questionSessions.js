import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const SESSION_STATUS = {
  WAITING: "waiting",
  COMPLETED: "completed",
};

export const ROLES = {
  CREATOR: "creator",
  INVITEE: "invitee",
};

export const LIMITS = {
  displayName: 24,
  answer: 1000,
  answersPerSubmit: 40,
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = new Set([
  "https://coffee-and.github.io",
  "https://eun-contents.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);

export function applyCors(request, response, methods = "GET, POST, PATCH, DELETE, OPTIONS") {
  const origin = request.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", methods);
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Max-Age", "86400");
}

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function jsonError(response, status, message) {
  return response.status(status).json({ ok: false, error: message });
}

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

export function tokenMatches(token, hash) {
  if (!token || !hash) return false;

  const left = Buffer.from(hashToken(token), "hex");
  const right = Buffer.from(hash, "hex");

  return left.length === right.length && timingSafeEqual(left, right);
}

export function cleanText(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, maxLength);
}

export function cleanAnswer(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim().slice(0, LIMITS.answer);
}

export function validateDisplayName(value) {
  const displayName = cleanText(value, LIMITS.displayName);

  if (!displayName) {
    return { ok: false, error: "이름 또는 닉네임을 입력해 주세요." };
  }

  return { ok: true, displayName };
}

export function getInviteCode(request) {
  const { inviteCode } = request.query ?? {};

  if (Array.isArray(inviteCode)) return inviteCode[0];
  if (inviteCode) return inviteCode;

  const pathname = new URL(request.url, "http://localhost").pathname;
  const parts = pathname.split("/").filter(Boolean);
  const index = parts.indexOf("question-sessions");
  return index >= 0 ? parts[index + 1] : "";
}

export async function loadSessionBundle(supabase, inviteCode) {
  const { data: session, error: sessionError } = await supabase
    .from("question_sessions")
    .select("*")
    .eq("public_token", inviteCode)
    .is("deleted_at", null)
    .single();

  if (sessionError) return { session: null, participants: [], answers: [], error: sessionError };

  const [{ data: participants, error: participantsError }, { data: answers, error: answersError }] =
    await Promise.all([
      supabase.from("question_participants").select("*").eq("session_id", session.id),
      supabase.from("question_answers").select("*").eq("session_id", session.id),
    ]);

  return {
    session,
    participants: participants ?? [],
    answers: answers ?? [],
    error: participantsError ?? answersError,
  };
}

export function findParticipantByToken(participants, token) {
  return participants.find((participant) => tokenMatches(token, participant.access_token_hash));
}

export function serializeSession({ session, participants, answers, participant = null }) {
  const creator = participants.find((item) => item.role === ROLES.CREATOR);
  const invitee = participants.find((item) => item.role === ROLES.INVITEE);
  const bothSubmitted = Boolean(creator?.submitted_at && invitee?.submitted_at);
  const isExpired = session.expires_at && new Date(session.expires_at).getTime() < Date.now();

  return {
    id: session.id,
    inviteCode: session.public_token,
    relationshipType: session.relationship_type,
    questionPackId: session.question_pack_id,
    status: bothSubmitted ? SESSION_STATUS.COMPLETED : session.status,
    expiresAt: session.expires_at,
    completedAt: session.completed_at,
    createdAt: session.created_at,
    isExpired,
    participant: participant
      ? {
          role: participant.role,
          displayName: participant.display_name,
          submittedAt: participant.submitted_at,
        }
      : null,
    participants: {
      creator: creator
        ? { displayName: creator.display_name, submittedAt: creator.submitted_at }
        : null,
      invitee: invitee
        ? { displayName: invitee.display_name, submittedAt: invitee.submitted_at }
        : null,
    },
    answers: bothSubmitted
      ? answers.map((answer) => ({
          questionId: answer.question_id,
          role: participants.find((item) => item.id === answer.participant_id)?.role,
          answer: answer.answer,
          updatedAt: answer.updated_at,
        }))
      : participant
        ? answers
            .filter((answer) => answer.participant_id === participant.id)
            .map((answer) => ({
              questionId: answer.question_id,
              role: participant.role,
              answer: answer.answer,
              updatedAt: answer.updated_at,
            }))
        : [],
  };
}
