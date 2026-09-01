import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Slug livre para o produto.
 *
 * O catálogo tem nomes repetidos de propósito (ex.: "Tema Cinderela"), e
 * `products.slug` é único. Sem sufixo, o segundo produto com o mesmo nome
 * estourava a unique constraint `products_slug_key` (23505) e a função
 * devolvia 500. `keepSlug` permite que o update mantenha o próprio slug.
 */
async function uniqueSlug(
  supabase: any,
  name: string,
  keepSlug?: string
): Promise<string> {
  const base = slugify(name) || "produto";
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .like("slug", `${base}%`);
  if (error) throw error;

  const taken = new Set<string>(
    (data ?? [])
      .map((row: { slug: string | null }) => row.slug)
      .filter((slug: string | null): slug is string => !!slug && slug !== keepSlug)
  );

  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function validateAdmin(supabase: any, token: string | null) {
  if (!token) return null;
  const { data: userVerification, error: verifyError } = await supabase.auth.getUser(token);
  if (verifyError || !userVerification?.user) return null;
  return userVerification.user;
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

  // Hoisted para o catch conseguir registrar qual operação falhou.
  let resource: unknown;
  let action: unknown;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    let admin_token: unknown, payload: any, id: unknown, slug: unknown;
    ({ resource, action, admin_token, payload, id, slug } = body ?? {});

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
        // Painel compartilhado: qualquer admin gerencia todos os clientes.
        // Filtrar por admin_id fazia o update casar 0 linhas (sem erro) nos
        // clientes vindos de reservas do site, que nascem com admin_id NULL —
        // o front mostrava "salvo" mas nada era gravado.
        const { data, error } = await supabase
          .from("clients")
          .update(updates)
          .eq("id", id)
          .select("id");
        if (error) throw error;
        if (!data || data.length === 0) {
          return json({ error: "Cliente não encontrado" }, 404);
        }
        return json({ success: true });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { data, error } = await supabase
          .from("clients")
          .delete()
          .eq("id", id)
          .select("id");
        if (error) throw error;
        if (!data || data.length === 0) {
          return json({ error: "Cliente não encontrado" }, 404);
        }
        return json({ success: true });
      }
    }

    // ── PRODUCTS ──
    if (resource === "products") {
      if (action === "create") {
        if (!payload?.name || typeof payload.name !== "string" || payload.name.length > 200) {
          return json({ error: "Nome inválido" }, 400);
        }
        const { data, error } = await supabase.from("products").insert({
          name: payload.name,
          slug: await uniqueSlug(supabase, payload.name),
          category: payload.category,
          price: payload.price,
          description: payload.description ?? null,
          dimensions: payload.dimensions ?? null,
          trending: !!payload.trending,
          image: payload.image ?? null,
        }).select("id, slug").single();
        if (error) throw error;
        // Devolve id/slug para o cliente anexar as imagens ao produto certo
        // (buscar depois por nome é ambíguo quando há nomes repetidos).
        return json({ success: true, data });
      }
      if (action === "update") {
        if (!slug) return json({ error: "Slug obrigatório" }, 400);
        const update: Record<string, unknown> = { ...(payload || {}) };
        delete update.slug;
        if (payload?.name) update.slug = await uniqueSlug(supabase, payload.name, slug);
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

    // ── CATEGORIES ──
    if (resource === "categories") {
      if (action === "create") {
        if (!payload?.name || typeof payload.name !== "string" || payload.name.length > 200) {
          return json({ error: "Nome inválido" }, 400);
        }
        const { data, error } = await supabase.from("categories").insert({
          name: payload.name,
          slug: slugify(payload.name),
          icon: payload.icon ?? null,
          display_order: payload.display_order ?? 99,
          is_active: payload.is_active ?? true,
        }).select().single();
        if (error) throw error;
        return json({ data });
      }
      if (action === "update") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const update: Record<string, unknown> = {};
        ["name", "icon", "display_order", "is_active"].forEach((k) => {
          if (payload?.[k] !== undefined) update[k] = payload[k];
        });
        if (payload?.name) update.slug = slugify(payload.name);
        const { data, error } = await supabase.from("categories").update(update).eq("id", id).select().single();
        if (error) throw error;
        return json({ data });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }
    }

    // ── BOOKINGS ──
    if (resource === "bookings") {
      if (action === "list") {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return json({ data });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { error } = await supabase.from("bookings").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }
    }

    // ── PRODUCT IMAGES ──
    if (resource === "product_images") {
      if (action === "list") {
        if (!id) return json({ error: "product_id obrigatório" }, 400);
        const { data, error } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", id)
          .order("ordem", { ascending: true });
        if (error) throw error;
        return json({ data });
      }
      if (action === "upsert_all") {
        if (!id || !Array.isArray(payload?.images)) {
          return json({ error: "product_id e images obrigatórios" }, 400);
        }

        type ImagePayload = {
          image_url?: unknown;
          custom_price?: unknown;
          nome_opcional?: unknown;
          is_primary?: unknown;
        };

        const input = payload.images as ImagePayload[];
        if (input.some((image) => typeof image.image_url !== "string" || !image.image_url.trim())) {
          return json({ error: "Todas imagens devem ter URL válida" }, 400);
        }

        const primaryIndex = input.findIndex((image) => image.is_primary === true);
        const images = input.map((image, idx) => {
          const rawPrice = image.custom_price;
          const customPrice = rawPrice === "" || rawPrice === null || rawPrice === undefined
            ? null
            : Number(rawPrice);
          if (customPrice !== null && (!Number.isFinite(customPrice) || customPrice < 0)) {
            throw new Error("Preço de imagem inválido");
          }
          const variationName = typeof image.nome_opcional === "string"
            ? image.nome_opcional.trim() || null
            : null;
          return {
            product_id: id,
            image_url: image.image_url!.trim(),
            custom_price: customPrice,
            nome_opcional: variationName,
            is_primary: input.length > 0 && (primaryIndex < 0 ? idx === 0 : idx === primaryIndex),
            ordem: idx,
            // Legacy fields remain synchronized while older clients are retired.
            price: customPrice,
            sort_order: idx,
          };
        });

        const { error: deleteError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", id);
        if (deleteError) throw deleteError;

        if (images.length > 0) {
          const { error } = await supabase.from("product_images").insert(images);
          if (error) throw error;
        }
        return json({ success: true, data: images });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { error } = await supabase.from("product_images").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }
    }

    // ── HERO BANNERS ──
    if (resource === "hero_banners") {
      if (action === "upsert") {
        const p = payload || {};
        if (p.id) {
          const update = { ...p };
          delete update.id;
          const { data, error } = await supabase.from("hero_banners").update(update).eq("id", p.id).select().single();
          if (error) throw error;
          return json({ data });
        }
        const { data, error } = await supabase.from("hero_banners").insert(p).select().single();
        if (error) throw error;
        return json({ data });
      }
    }

    // ── SITE SETTINGS ──
    if (resource === "site_settings") {
      if (action === "upsert") {
        const p = { ...(payload || {}), id: "default" };
        const { data, error } = await supabase.from("site_settings").upsert(p, { onConflict: "id" }).select().single();
        if (error) throw error;
        return json({ data });
      }
    }

    // ── FREQUENTLY ASKED QUESTIONS ──
    if (resource === "frequently_asked_questions") {
      if (action === "create") {
        const { data, error } = await supabase.from("frequently_asked_questions").insert(payload).select().single();
        if (error) throw error;
        return json({ data });
      }
      if (action === "update") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { data, error } = await supabase.from("frequently_asked_questions").update(payload).eq("id", id).select().single();
        if (error) throw error;
        return json({ data });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { error } = await supabase.from("frequently_asked_questions").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }
      if (action === "upsert_all") {
        if (!Array.isArray(payload)) return json({ error: "payload deve ser array" }, 400);
        
        // Excluir todos e reinserir
        await supabase.from("frequently_asked_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        
        if (payload.length > 0) {
          const items = payload.map((item, idx) => ({
            question: item.question,
            answer: item.answer,
            display_order: idx,
            is_active: true
          }));
          const { error } = await supabase.from("frequently_asked_questions").insert(items);
          if (error) throw error;
        }
        return json({ success: true });
      }
    }

    // ── ART DETAILS IMAGES ──
    if (resource === "art_details_images") {
      if (action === "create") {
        const { data, error } = await supabase.from("art_details_images").insert(payload).select().single();
        if (error) throw error;
        return json({ data });
      }
      if (action === "update") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { data, error } = await supabase.from("art_details_images").update(payload).eq("id", id).select().single();
        if (error) throw error;
        return json({ data });
      }
      if (action === "delete") {
        if (!id) return json({ error: "ID obrigatório" }, 400);
        const { error } = await supabase.from("art_details_images").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }
      if (action === "upsert_all") {
        if (!Array.isArray(payload)) return json({ error: "payload deve ser array" }, 400);
        
        // Excluir todos e reinserir
        await supabase.from("art_details_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        
        if (payload.length > 0) {
          const items = payload.map((item, idx) => ({
            image_url: item.image_url || item.src,
            image_alt: item.image_alt || item.alt,
            title: item.title,
            display_order: idx,
            is_active: true
          }));
          const { error } = await supabase.from("art_details_images").insert(items);
          if (error) throw error;
        }
        return json({ success: true });
      }
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    // Log estruturado para diagnóstico via Management API (function_logs).
    // Erros do PostgREST/Postgres trazem code/details/hint úteis (ex.: 42703
    // "column does not exist") que o log genérico anterior descartava.
    const e = err as { message?: string; code?: string; details?: string; hint?: string };
    console.error(
      JSON.stringify({
        resource,
        action,
        message: e?.message ?? String(err),
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
      })
    );
    // Devolve a mensagem real do banco ao admin autenticado (não contém
    // segredos, só o motivo da rejeição) para não haver "sucesso falso".
    return json({ error: e?.message ?? "Erro interno do servidor", code: e?.code }, 500);
  }
});
