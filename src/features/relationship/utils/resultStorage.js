import { buildResultUrl } from "../../../app/routes.js";

const RESULT_STORAGE_KEY = "eun-contents-relationship-results";
const LEGACY_RESULT_STORAGE_KEY = "relationship-analyzer-results";

export { buildResultUrl };

function parseStoredResults(storageKey) {
  const rawData = window.localStorage.getItem(storageKey);

  if (!rawData) return {};

  try {
    return JSON.parse(rawData);
  } catch {
    return {};
  }
}

function readStoredResults() {
  const currentResults = parseStoredResults(RESULT_STORAGE_KEY);
  const legacyResults = parseStoredResults(LEGACY_RESULT_STORAGE_KEY);
  const mergedResults = {
    ...legacyResults,
    ...currentResults,
  };

  if (Object.keys(legacyResults).length > 0) {
    writeStoredResults(mergedResults);
  }

  return mergedResults;
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

export function clearResultUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("resultId");
  const [hashPath, hashQuery] = url.hash.split("?");

  if (hashQuery) {
    const hashParams = new URLSearchParams(hashQuery);
    hashParams.delete("resultId");
    const nextHashQuery = hashParams.toString();
    url.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath;
  }

  window.history.replaceState({}, "", url.toString());
}
