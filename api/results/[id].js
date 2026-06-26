import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = new Set([
  "https://coffee-and.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
]);

function applyCors(request, response) {
  const origin = request.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Max-Age", "86400");
}

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getResultId(request) {
  const { id } = request.query ?? {};

  if (Array.isArray(id)) return id[0];
  if (id) return id;

  const pathname = new URL(request.url, "http://localhost").pathname;
  const pathParts = pathname.split("/").filter(Boolean);
  return pathParts[pathParts.length - 1];
}

export default async function handler(request, response) {
  applyCors(request, response);

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

    if (!id) {
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

    return response.status(200).json({
      ok: true,
      result: {
        id: data.id,
        relationshipMode: data.mode,
        answers: data.answers?.items ?? [],
        scores: data.scores,
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
