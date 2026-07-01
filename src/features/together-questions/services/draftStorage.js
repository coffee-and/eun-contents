// Together Questions 작성 중 임시 저장과 최근 결과 복구를 관리합니다.
const DRAFT_KEY = "eun:together-questions:v4:draft";
const RESULT_KEY = "eun:together-questions:v4:result";
const RESUME_DRAFT_KEY = "eun:together-questions:resume-draft";
const LEGACY_KEYS = [
  "eun:together-questions:v3:draft",
  "eun:together-questions:v3:result",
];
const STORAGE_SCHEMA_VERSION = 2;
const ACTIVE_RELATIONSHIP_IDS = new Set(["partner", "parent", "child", "friends"]);

let didClearLegacyStorage = false;

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

function clearLegacyStorage() {
  if (didClearLegacyStorage) return;

  LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
  didClearLegacyStorage = true;
}

function isValidForm(form) {
  return (
    isRecord(form) &&
    ACTIVE_RELATIONSHIP_IDS.has(form.relationshipType) &&
    typeof form.displayName === "string" &&
    typeof form.questionPackId === "string"
  );
}

function normalizeStoredData(value, { requireCompletedAt = false } = {}) {
  if (
    !isRecord(value) ||
    value.schemaVersion !== STORAGE_SCHEMA_VERSION ||
    !isValidForm(value.form) ||
    !isRecord(value.answers)
  ) {
    return null;
  }

  if (requireCompletedAt && typeof value.completedAt !== "string") {
    return null;
  }

  return value;
}

function readStoredData(key, options) {
  clearLegacyStorage();
  return normalizeStoredData(safeJsonParse(window.localStorage.getItem(key)), options);
}

function writeStoredData(key, value) {
  clearLegacyStorage();
  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...value,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
    })
  );
}

export function peekDraft() {
  return readStoredData(DRAFT_KEY);
}

export function requestDraftResume() {
  window.sessionStorage.setItem(RESUME_DRAFT_KEY, "true");
}

export function loadDraft() {
  const shouldResume = window.sessionStorage.getItem(RESUME_DRAFT_KEY) === "true";
  window.sessionStorage.removeItem(RESUME_DRAFT_KEY);
  return shouldResume ? peekDraft() : null;
}

export function saveDraft(draft) {
  writeStoredData(DRAFT_KEY, draft);
}

export function clearDraft() {
  window.localStorage.removeItem(DRAFT_KEY);
  window.sessionStorage.removeItem(RESUME_DRAFT_KEY);
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
