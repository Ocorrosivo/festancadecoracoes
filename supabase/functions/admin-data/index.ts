import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function validateAdmin(supabase: any, token: string | null) {
  if (!token) return null;
  const { data } = await supabase
    .from("admin_users")
    .select("id, status")
    .eq("session_token", token)
    .eq("status", "ativo")
    .single();
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { resource, action, admin_token, payload, id, slug } = body ?? {};

    const admin = await validateAdmin(supabase, admin_token);
    if (!admin) return json({ error: "Sessão inválida ou expirada." }, 401);

    // ── CLIENTS ──
    if (resource === "clients") {
      if (action === "list") {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .order("nome", { ascending: true });
        if (error) throw error;
        return json({ data });
      }
      if (action === "get") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { data: client, error: errClient } = await supabase
          .from("clients")
          .select("*")
          .eq("id", id)
          .single();
        if (errClient) throw errClient;

        const { data: bookings, error: errBookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("client_id", id)
          .order("date", { ascending: false });
        if (errBookings) throw errBookings;

        return json({ data: client, bookings: bookings || [] });
      }
      if (action === "create") {
        if (!payload?.nome || typeof payload.nome !== "string" || payload.nome.length > 200) {
          return json({ error: "Nome inválido" }, 400);
        }
        const { error } = await supabase.from("clients").insert([{
          nome: payload.nome,
          email: payload.email || null,
          telefone: payload.telefone || null,
          empresa: payload.empresa || null,
          status: payload.status || "Ativo",
          cidade: payload.cidade || null,
          admin_id: admin.id,
        }]);
        if (error) throw error;
        return json({ success: true });
      }
      if (action === "update") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const updates: Record<string, unknown> = {};
        ["nome", "email", "telefone", "empresa", "status", "cidade"].forEach((k) => {
          if (payload?.[k] !== undefined) updates[k] = payload[k] || null;
        });
        const { error } = await supabase
          .from("clients")
          .update(updates)
          .eq("id", id)
          .eq("admin_id", admin.id);
        if (error) throw error;
        return json({ success: true });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { error } = await supabase
          .from("clients")
          .delete()
          .eq("id", id)
          .eq("admin_id", admin.id);
        if (error) throw error;
        return json({ success: true });
      }
    }

    // ── PRODUCTS ──
    if (resource === "products") {
      if (action === "create") {
        if (!payload?.name || typeof payload.name !== "string" || payload.name.length > 200) {
          return json({ error: "Nome inválido" }, 400);
        }
        const { error } = await supabase.from("products").insert({
          name: payload.name,
          slug: slugify(payload.name),
          category: payload.category,
          price: payload.price,
          description: payload.description ?? null,
          dimensions: payload.dimensions ?? null,
          trending: !!payload.trending,
          image: payload.image ?? null,
        });
        if (error) throw error;
        return json({ success: true });
      }
      if (action === "update") {
        if (!slug) return json({ error: "Slug obrigatório" }, 400);
        const update: Record<string, unknown> = { ...(payload || {}) };
        delete update.slug;
        if (payload?.name) update.slug = slugify(payload.name);
        const { error } = await supabase.from("products").update(update).eq("slug", slug);
        if (error) throw error;
        return json({ success: true });
      }
      if (action === "delete") {
        if (!slug) return json({ error: "Slug obrigatório" }, 400);
        const { error } = await supabase.from("products").delete().eq("slug", slug);
        if (error) throw error;
        return json({ success: true });
      }
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
