const RESULT_STORAGE_KEY = "relationship-analyzer-results";

function readStoredResults() {
  const rawData = window.localStorage.getItem(RESULT_STORAGE_KEY);

  if (!rawData) return {};

  try {
    return JSON.parse(rawData);
  } catch {
    return {};
  }
}

function writeStoredResults(results) {
  window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(results));
}

export function createResultId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `result-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getStoredResult(resultId) {
  if (!resultId) return null;

  const results = readStoredResults();
  return results[resultId] ?? null;
}

export function saveResult({ analysis, answers, relationshipMode }) {
  const id = createResultId();
  const results = readStoredResults();
  const savedAt = new Date().toISOString();

  const nextResult = {
    id,
    analysis,
    answers,
    relationshipMode,
    savedAt,
  };

  writeStoredResults({
    ...results,
    [id]: nextResult,
  });

  return nextResult;
}

export function buildResultUrl(resultId) {
  const url = new URL(window.location.href);
  url.searchParams.set("resultId", resultId);
  return url.toString();
}

export function clearResultUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("resultId");
  window.history.replaceState({}, "", url.toString());
}
