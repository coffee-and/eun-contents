// Relationship Analyzer 저장 결과 조회 API입니다.
import { applyCors, getSupabaseClient } from "../../lib/server/results.js";
import { normalizeRelationshipMode } from "../../lib/shared/relationshipModes.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getResultId(request) {
  const { id } = request.query ?? {};

  if (Array.isArray(id)) return id[0];
  if (id) return id;

  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const pathParts = pathname.split("/").filter(Boolean);
    return pathParts[pathParts.length - 1] ?? "";
  } catch {
    return "";
  }
}

export default async function handler(request, response) {
  applyCors(request, response, ["GET", "OPTIONS"]);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");

    return response.status(405).json({
      ok: false,
      error: "Method not allowed.",
    });
  }

  try {
    const id = getResultId(request);

    if (!id || !UUID_PATTERN.test(id)) {
      return response.status(404).json({
        ok: false,
        error: "Result not found.",
      });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("results")
      .select(
        "id, mode, answers, scores, analysis, result_type, report_status, created_at"
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return response.status(404).json({
          ok: false,
          error: "Result not found.",
        });
      }

      throw error;
    }

    const relationshipMode = normalizeRelationshipMode(data.mode);

    if (!relationshipMode || !data.analysis || typeof data.analysis !== "object") {
      return response.status(404).json({
        ok: false,
        error: "Result not found.",
      });
    }

    return response.status(200).json({
      ok: true,
      result: {
        id: data.id,
        relationshipMode,
        answers: Array.isArray(data.answers?.items) ? data.answers.items : [],
        scores: data.scores && typeof data.scores === "object" ? data.scores : {},
        analysis: data.analysis,
        resultType: data.result_type,
        reportStatus: data.report_status,
        savedAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("Failed to load result:", error);

    return response.status(500).json({
      ok: false,
      error: "Failed to load result.",
    });
  }
}
