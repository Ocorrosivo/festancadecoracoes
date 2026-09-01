import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invokeAdminData } from "@/utils/adminApi";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_CATEGORIES_LIST: CategoryItem[] = [
  { id: "1", name: "Infantil menina", slug: "infantil-menina", display_order: 1, is_active: true },
  { id: "2", name: "Infantil menino", slug: "infantil-menino", display_order: 2, is_active: true },
  { id: "3", name: "Chá de bebê", slug: "cha-de-bebe", display_order: 3, is_active: true },
  { id: "4", name: "Chá revelação", slug: "cha-revelacao", display_order: 4, is_active: true },
  { id: "5", name: "15 anos", slug: "15-anos", display_order: 5, is_active: true },
  { id: "6", name: "Formatura", slug: "formatura", display_order: 6, is_active: true },
  { id: "7", name: "Casamento", slug: "casamento", display_order: 7, is_active: true },
  { id: "8", name: "Chá de casa nova", slug: "cha-de-casa-nova", display_order: 8, is_active: true },
  { id: "9", name: "Feminina", slug: "feminina", display_order: 9, is_active: true },
  { id: "10", name: "Masculina", slug: "masculina", display_order: 10, is_active: true },
  { id: "11", name: "Brinquedos", slug: "brinquedos", display_order: 11, is_active: true },
];

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const useCategories = (onlyActive: boolean = false) => {
  return useQuery({
    queryKey: ["categories", onlyActive],
    queryFn: async (): Promise<CategoryItem[]> => {
      try {
        let query = supabase.from("categories").select("*").order("display_order", { ascending: true });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          return onlyActive ? DEFAULT_CATEGORIES_LIST.filter((c) => c.is_active) : DEFAULT_CATEGORIES_LIST;
        }
        return data as CategoryItem[];
      } catch {
        return onlyActive ? DEFAULT_CATEGORIES_LIST.filter((c) => c.is_active) : DEFAULT_CATEGORIES_LIST;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

const callAdminData = async (body: Record<string, unknown>) =>
  invokeAdminData<{ data?: unknown }>({ ...body, resource: "categories" });

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon?: string }) => {
      const res = await callAdminData({ action: "create", payload: { name, icon: icon || null } });
      return res?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryItem> }) => {
      const res = await callAdminData({ action: "update", id, payload: data });
      return res?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await callAdminData({ action: "delete", id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};
