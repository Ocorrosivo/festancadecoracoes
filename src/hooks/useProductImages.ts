import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toNumberOrNull, type ProductImage } from "@/utils/productImagePrice";

interface DbProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  custom_price: string | number | null;
  nome_opcional: string | null;
  ordem: number | null;
  price: string | number | null;
  sort_order: number | null;
  created_at: string | null;
}

const toProductImage = (row: DbProductImage, idx: number): ProductImage => ({
  id: row.id,
  product_id: row.product_id,
  image_url: row.image_url,
  is_primary: !!row.is_primary,
  custom_price: toNumberOrNull(row.custom_price ?? row.price),
  nome_opcional: row.nome_opcional ?? null,
  ordem: row.ordem ?? row.sort_order ?? idx,
  created_at: row.created_at ?? null,
});

/**
 * Leitura pública somente-leitura das variações de imagem de um produto,
 * ordenadas por `ordem`. Retorna array vazio quando não há registros.
 */
export const useProductImages = (productId: string | undefined | null) => {
  return useQuery({
    queryKey: ["product_images", productId],
    enabled: !!productId,
    queryFn: async (): Promise<ProductImage[]> => {
      if (!productId) return [];
      try {
        const { data, error } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("ordem", { ascending: true });

        if (error || !Array.isArray(data)) return [];
        return data.map((row, idx) => toProductImage(row as DbProductImage, idx));
      } catch (err) {
        console.error("[useProductImages] Erro ao buscar imagens:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
