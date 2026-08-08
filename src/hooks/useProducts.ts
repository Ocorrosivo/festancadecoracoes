import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts, type Product } from "@/data/products";
import { slugify } from "./useCategories";

// ─── DB Row → Product mapping ──────────────────────────────────────────────

interface DbProduct {
  id: string;
  name: string | null;
  slug: string | null;
  category: string | null;
  price: string | null;
  description: string | null;
  dimensions: string | null;
  trending: boolean | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

const toProduct = (row: DbProduct): Product => ({
  name: row.name || "Decoração de Festa",
  slug: row.slug || slugify(row.name || "decoracao"),
  category: row.category || "Geral",
  price: row.price || "Sob consulta",
  description: row.description ?? undefined,
  dimensions: row.dimensions ?? undefined,
  trending: row.trending ?? false,
  image: row.image || "",
});

// ─── Admin token helper ────────────────────────────────────────────────────

const getAdminToken = (): string | null =>
  localStorage.getItem("festiva_admin_token");

// ─── READ: public query via Supabase directly ──────────────────────────────

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        let dbProducts: Product[] = [];
        if (!error && Array.isArray(data) && data.length > 0) {
          dbProducts = data
            .filter((r) => r && r.slug)
            .map((r) => toProduct(r as DbProduct));
        }

        return dbProducts;
      } catch (err) {
        console.error("[useProducts] Erro ao buscar produtos:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,   // 5 min cache
    retry: 2,
    retryDelay: 500,
  });
};

// ─── WRITE: via Edge Function (uses service_role — bypasses RLS auth.uid()) ─

const callAdminData = async (body: Record<string, unknown>) => {
  const admin_token = getAdminToken();
  if (!admin_token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  const { data, error } = await supabase.functions.invoke("admin-data", {
    body: { ...body, admin_token, resource: "products" },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

export const useAddProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, "slug">) => {
      await callAdminData({ action: "create", payload: product });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: (err: Error) => {
      console.error("[useAddProduct] Erro:", err.message);
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string;
      data: Partial<Product>;
    }) => {
      await callAdminData({ action: "update", slug, payload: data });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: (err: Error) => {
      console.error("[useUpdateProduct] Erro:", err.message);
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await callAdminData({ action: "delete", slug });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: (err: Error) => {
      console.error("[useDeleteProduct] Erro:", err.message);
    },
  });
};
