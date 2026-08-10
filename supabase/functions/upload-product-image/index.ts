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
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const ALLOWED_BUCKETS = ["product-images", "festanca-storage"];
    const ALLOWED_FOLDERS = ["banners", "logos", "favicon", "produtos", "categorias", "configuracoes"];

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const adminToken = formData.get("admin_token") as string | null;
    const bucketInput = (formData.get("bucket") as string | null) || "product-images";
    const folderInput = formData.get("folder") as string | null;

    if (!adminToken) return json({ error: "Não autorizado" }, 401);
    if (!file) return json({ error: "Nenhum arquivo enviado" }, 400);

    const bucket = ALLOWED_BUCKETS.includes(bucketInput) ? bucketInput : "product-images";
    const folder = folderInput && ALLOWED_FOLDERS.includes(folderInput) ? folderInput : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate admin token using native Auth
    const { data: userVerification, error: verifyError } = await supabase.auth.getUser(adminToken);
    if (verifyError || !userVerification.user) {
      return json({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }

    // Upload using service role (bypasses RLS)
    const ext = file.name.split(".").pop() || "jpg";
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileName = folder ? `${folder}/${base}` : base;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return json({ error: "Falha no upload: " + uploadError.message }, 500);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return json({ success: true, url: urlData.publicUrl });
  } catch (err) {
    console.error("Server error:", err);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
