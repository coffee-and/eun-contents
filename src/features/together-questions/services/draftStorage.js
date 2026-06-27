const DRAFT_PREFIX = "eun:together-questions:v2:draft:";
const TOKEN_PREFIX = "eun:together-questions:v2:participant:";

function safeJsonParse(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getDraftKey(inviteCode, role) {
  return `${DRAFT_PREFIX}${inviteCode}:${role}`;
}

export function loadDraft(inviteCode, role) {
  if (!inviteCode || !role) return {};

  const saved = safeJsonParse(window.localStorage.getItem(getDraftKey(inviteCode, role)));
  return saved && typeof saved.answers === "object" ? saved.answers : {};
}

export function saveDraft(inviteCode, role, answers) {
  if (!inviteCode || !role) return;

  window.localStorage.setItem(
    getDraftKey(inviteCode, role),
    JSON.stringify({ answers, savedAt: new Date().toISOString() })
  );
}

export function clearDraft(inviteCode, role) {
  if (!inviteCode || !role) return;
  window.localStorage.removeItem(getDraftKey(inviteCode, role));
}

export function saveParticipantToken(inviteCode, token) {
  if (!inviteCode || !token) return;
  window.localStorage.setItem(`${TOKEN_PREFIX}${inviteCode}`, token);
}

export function loadParticipantToken(inviteCode) {
  if (!inviteCode) return "";
  return window.localStorage.getItem(`${TOKEN_PREFIX}${inviteCode}`) ?? "";
}

export function clearParticipantToken(inviteCode) {
  if (!inviteCode) return;
  window.localStorage.removeItem(`${TOKEN_PREFIX}${inviteCode}`);
}
