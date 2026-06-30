import { buildResultUrl } from "../../../app/routes.js";
import { normalizeRelationshipMode } from "../../../../lib/shared/relationshipModes.js";

const RESULT_STORAGE_KEY = "eun-contents-relationship-results";
const LEGACY_RESULT_STORAGE_KEY = "relationship-analyzer-results";

export { buildResultUrl };

function parseStoredResults(storageKey) {
  const rawData = window.localStorage.getItem(storageKey);

  if (!rawData) return {};

  try {
    const parsed = JSON.parse(rawData);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function normalizeStoredResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }

  const relationshipMode = normalizeRelationshipMode(result.relationshipMode);

  if (!relationshipMode) return null;

  return {
    ...result,
    relationshipMode,
  };
}

function readStoredResults() {
  const currentResults = parseStoredResults(RESULT_STORAGE_KEY);
  const legacyResults = parseStoredResults(LEGACY_RESULT_STORAGE_KEY);
  const mergedResults = {
    ...legacyResults,
    ...currentResults,
  };
  const normalizedResults = Object.fromEntries(
    Object.entries(mergedResults)
      .map(([id, result]) => [id, normalizeStoredResult(result)])
      .filter(([, result]) => Boolean(result))
  );

  if (
    Object.keys(legacyResults).length > 0 ||
    Object.keys(normalizedResults).length !== Object.keys(currentResults).length
  ) {
    writeStoredResults(normalizedResults);
  }

  return normalizedResults;
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
  const normalizedMode = normalizeRelationshipMode(relationshipMode);

  if (!normalizedMode) return null;

  const id = createResultId();
  const results = readStoredResults();
  const savedAt = new Date().toISOString();

  const nextResult = {
    id,
    analysis,
    answers,
    relationshipMode: normalizedMode,
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
