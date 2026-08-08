import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const adminToken = formData.get("admin_token") as string | null;

    if (!adminToken) return json({ error: "Não autorizado" }, 401);
    if (!file) return json({ error: "Nenhum arquivo enviado" }, 400);

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
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return json({ error: "Falha no upload: " + uploadError.message }, 500);
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return json({ success: true, url: urlData.publicUrl });
  } catch (err) {
    console.error("Server error:", err);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
