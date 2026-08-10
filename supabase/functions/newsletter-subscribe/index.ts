import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://festancadecoracoes.com.br",
  "https://www.festancadecoracoes.com.br",
  "https://gray-echidna-179762.hostingersite.com",
  "http://localhost:5173",
  "http://localhost:8080",
];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Store in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("newsletter_subscribers").upsert(
      { email: cleanEmail },
      { onConflict: "email" }
    );

    // Send notification to business email via Supabase's built-in email
    // We'll use a simple fetch to a mail API or store for manual review
    // For now, store in DB - the admin can check subscribers in the panel

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
