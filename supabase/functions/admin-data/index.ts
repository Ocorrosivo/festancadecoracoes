import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
