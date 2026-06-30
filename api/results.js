// Relationship Analyzer 결과 저장 API입니다.
import { applyCors, getSupabaseClient } from "../lib/server/results.js";
import {
  isRelationshipMode,
  normalizeRelationshipMode,
  toDatabaseRelationshipMode,
} from "../lib/shared/relationshipModes.js";

const MAX_SERIALIZED_PAYLOAD_LENGTH = 250_000;
const MAX_RESULT_TYPE_LENGTH = 120;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPayloadSizeAllowed(value) {
  try {
    return JSON.stringify(value).length <= MAX_SERIALIZED_PAYLOAD_LENGTH;
  } catch {
    return false;
  }
}

export default async function handler(request, response) {
  applyCors(request, response, ["POST", "OPTIONS"]);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");

    return response.status(405).json({
      ok: false,
      error: "Method not allowed.",
    });
  }

  try {
    const body = isPlainObject(request.body) ? request.body : {};
    const {
      mode,
      answers = {},
      scores = {},
      analysis = null,
      resultType = null,
    } = body;
    const normalizedMode = normalizeRelationshipMode(mode);

    if (!normalizedMode || !isRelationshipMode(normalizedMode)) {
      return response.status(400).json({
        ok: false,
        error: "Invalid mode.",
      });
    }

    if (!isPlainObject(answers)) {
      return response.status(400).json({
        ok: false,
        error: "Answers must be an object.",
      });
    }

    if (!isPlainObject(scores)) {
      return response.status(400).json({
        ok: false,
        error: "Scores must be an object.",
      });
    }

    if (!isPlainObject(analysis)) {
      return response.status(400).json({
        ok: false,
        error: "Analysis must be an object.",
      });
    }

    if (
      resultType !== null &&
      (typeof resultType !== "string" || resultType.length > MAX_RESULT_TYPE_LENGTH)
    ) {
      return response.status(400).json({
        ok: false,
        error: "Invalid result type.",
      });
    }

    if (!isPayloadSizeAllowed({ answers, scores, analysis, resultType })) {
      return response.status(413).json({
        ok: false,
        error: "Result payload is too large.",
      });
    }

    const databaseMode = toDatabaseRelationshipMode(normalizedMode);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("results")
      .insert({
        mode: databaseMode,
        answers,
        scores,
        analysis,
        result_type: resultType,
        report_status: "free",
      })
      .select("id, mode, result_type, report_status, created_at")
      .single();

    if (error) {
      throw error;
    }

    return response.status(201).json({
      ok: true,
      result: {
        id: data.id,
        mode: normalizeRelationshipMode(data.mode),
        resultType: data.result_type,
        reportStatus: data.report_status,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("Failed to save result:", error);

    return response.status(500).json({
      ok: false,
      error: "Failed to save result.",
    });
  }
}
