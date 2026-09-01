import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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
    const ALLOWED_BUCKETS = ["festanca-storage"];
    const ALLOWED_FOLDERS = ["banners", "logos", "favicon", "products", "produtos", "categorias", "configuracoes"];

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("FormData parse error:", e);
      return json({ success: false, error: "Não foi possível processar os dados do upload." }, 400);
    }

    const file = formData.get("file") as File | null;
    const adminToken = formData.get("admin_token") as string | null;
    const authHeader = req.headers.get("Authorization");
    const token = adminToken || (authHeader ? authHeader.replace("Bearer ", "") : null);

    const bucketInput = (formData.get("bucket") as string | null) || "festanca-storage";
    const folderInput = formData.get("folder") as string | null;

    if (!token) {
      console.error("Missing authorization token.");
      return json({ success: false, error: "Não autorizado" }, 401);
    }
    if (!file) {
      console.error("No file provided in FormData.");
      return json({ success: false, error: "Nenhum arquivo enviado" }, 400);
    }

    const bucket = ALLOWED_BUCKETS.includes(bucketInput) ? bucketInput : "festanca-storage";
    const folder = folderInput && ALLOWED_FOLDERS.includes(folderInput) ? folderInput : null;

    console.log(`Starting upload. File: ${file.name}, Size: ${file.size}, Bucket: ${bucket}, Folder: ${folder}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );

    // Validate token using native Auth
    const { data: userVerification, error: verifyError } = await supabase.auth.getUser(token);
    if (verifyError || !userVerification.user) {
      console.error("Invalid token verification:", verifyError);
      return json({ success: false, error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }

    // Upload using service role (bypasses RLS)
    const ext = file.name.split(".").pop() || "jpg";
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileName = folder ? `${folder}/${base}` : base;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
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
