// Relationship Analyzer 결과 저장 API입니다.
import { applyCors, getSupabaseClient } from "../lib/server/results.js";

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
    const {
      mode,
      answers = {},
      scores = {},
      analysis = null,
      resultType = null,
    } = request.body ?? {};

    if (!["relationship", "couple", "marriage"].includes(mode)) {
      return response.status(400).json({
        ok: false,
        error: "Invalid mode.",
      });
    }

    if (
      typeof answers !== "object" ||
      answers === null ||
      Array.isArray(answers)
    ) {
      return response.status(400).json({
        ok: false,
        error: "Answers must be an object.",
      });
    }

    if (
      typeof scores !== "object" ||
      scores === null ||
      Array.isArray(scores)
    ) {
      return response.status(400).json({
        ok: false,
        error: "Scores must be an object.",
      });
    }

    if (
      typeof analysis !== "object" ||
      analysis === null ||
      Array.isArray(analysis)
    ) {
      return response.status(400).json({
        ok: false,
        error: "Analysis must be an object.",
      });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("results")
      .insert({
        mode,
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
        mode: data.mode,
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
