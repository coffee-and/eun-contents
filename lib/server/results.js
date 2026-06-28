import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = new Set([
  "https://coffee-and.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
]);

export function applyCors(request, response, methods) {
  const origin = request.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Max-Age", "86400");
}

export function getSupabaseClient() {
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
