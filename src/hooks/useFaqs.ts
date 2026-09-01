import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invokeAdminData } from "@/utils/adminApi";
import { toast } from "sonner";

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
}

export const useFaqs = (onlyActive: boolean = true) => {
  return useQuery({
    queryKey: ["faqs", onlyActive],
    queryFn: async (): Promise<FaqItem[]> => {
      try {
        let query = supabase.from("frequently_asked_questions").select("*").order("display_order", { ascending: true });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (error || !data) return [];
        return data as FaqItem[];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

const callAdminData = async (body: Record<string, unknown>) =>
  invokeAdminData<{ data?: unknown }>({ ...body, resource: "frequently_asked_questions" });

export const useAddFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FaqItem) => {
      const res = await callAdminData({ action: "create", payload: data });
      return res?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FaqItem> }) => {
      const res = await callAdminData({ action: "update", id, payload: data });
      return res?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await callAdminData({ action: "delete", id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

export const useUpdateFaqs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (faqs: FaqItem[]) => {
      const res = await callAdminData({ action: "upsert_all", payload: faqs });
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("Perguntas frequentes atualizadas!");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar FAQs: " + (err.message || "Erro desconhecido"));
    }
  });
};

