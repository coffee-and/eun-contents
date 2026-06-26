import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export default async function handler(request, response) {
  if (!supabaseUrl || !supabaseSecretKey) {
    return response.status(500).json({
      ok: false,
      error: "Supabase environment variables are missing.",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase
    .from("results")
    .select("id")
    .limit(1);

  if (error) {
    return response.status(500).json({
      ok: false,
      error: error.message,
    });
  }

  return response.status(200).json({
    ok: true,
    service: "supabase",
    message: "Supabase connection successful.",
    timestamp: new Date().toISOString(),
  });
}