// Together Questions 작성 중 임시 저장과 최근 결과 복구를 관리합니다.
const DRAFT_KEY = "eun:together-questions:v3:draft";
const RESULT_KEY = "eun:together-questions:v3:result";

function safeJsonParse(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadDraft() {
  const saved = safeJsonParse(window.localStorage.getItem(DRAFT_KEY));
  return saved && typeof saved === "object" ? saved : null;
}

export function saveDraft(draft) {
  window.localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
  );
}

export function clearDraft() {
  window.localStorage.removeItem(DRAFT_KEY);
}

export function loadSavedResult() {
  const saved = safeJsonParse(window.localStorage.getItem(RESULT_KEY));
  return saved && typeof saved === "object" ? saved : null;
}

export function saveResult(result) {
  window.localStorage.setItem(
    RESULT_KEY,
    JSON.stringify({ ...result, savedAt: new Date().toISOString() })
  );
}

export function clearSavedResult() {
  window.localStorage.removeItem(RESULT_KEY);
}
