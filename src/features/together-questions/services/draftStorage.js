// Together Questions 작성 중 임시 저장과 최근 결과 복구를 관리합니다.
const DRAFT_KEY = "eun:together-questions:v3:draft";
const RESULT_KEY = "eun:together-questions:v3:result";
const STORAGE_SCHEMA_VERSION = 1;

function safeJsonParse(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidForm(form) {
  return (
    isRecord(form) &&
    typeof form.relationshipType === "string" &&
    typeof form.displayName === "string" &&
    typeof form.questionPackId === "string"
  );
}

function normalizeStoredData(value, { requireCompletedAt = false } = {}) {
  if (!isRecord(value) || !isValidForm(value.form) || !isRecord(value.answers)) {
    return null;
  }

  if (
    value.schemaVersion !== undefined &&
    value.schemaVersion !== STORAGE_SCHEMA_VERSION
  ) {
    return null;
  }

  if (requireCompletedAt && typeof value.completedAt !== "string") {
    return null;
  }

  return value;
}

function readStoredData(key, options) {
  return normalizeStoredData(
    safeJsonParse(window.localStorage.getItem(key)),
    options
  );
}

function writeStoredData(key, value) {
  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...value,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
    })
  );
}

export function loadDraft() {
  return readStoredData(DRAFT_KEY);
}

export function saveDraft(draft) {
  writeStoredData(DRAFT_KEY, draft);
}

export function clearDraft() {
  window.localStorage.removeItem(DRAFT_KEY);
}

export function loadSavedResult() {
  return readStoredData(RESULT_KEY, { requireCompletedAt: true });
}

export function saveResult(result) {
  writeStoredData(RESULT_KEY, result);
}

export function clearSavedResult() {
  window.localStorage.removeItem(RESULT_KEY);
}
