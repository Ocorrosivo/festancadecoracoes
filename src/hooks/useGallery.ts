import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { supabase } from "@/integrations/supabase/client";
import { invokeAdminData } from "@/utils/adminApi";
import { toast } from "sonner";

export interface GalleryImage {
  id?: string;
  image_url: string;
  image_alt?: string;
  title?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface GallerySettings {
  title: string;
  quote: string;
}

export const DEFAULT_GALLERY_SETTINGS: GallerySettings = {
  title: "Nossa *Arte em Detalhes*",
  quote: "\"Transformamos espaços em experiências inesquecíveis, cuidando de cada detalhe com amor e dedicação.\"",
};

export const useGallerySettings = () => {
  return useQuery({
    queryKey: ["site_gallery_settings"],
    queryFn: async (): Promise<GallerySettings> => {
      try {
        const { data } = supabase.storage.from("festanca-storage").getPublicUrl("configuracoes/gallery.json");
        const res = await fetch(`${data.publicUrl}?t=${Date.now()}`);
        if (!res.ok) return DEFAULT_GALLERY_SETTINGS;
        const json = await res.json();
        return {
          title: json.title || DEFAULT_GALLERY_SETTINGS.title,
          quote: json.quote || DEFAULT_GALLERY_SETTINGS.quote,
        };
      } catch (err) {
        return DEFAULT_GALLERY_SETTINGS;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateGallerySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gallery: GallerySettings) => {
      const file = new File([JSON.stringify(gallery)], "gallery.json", { type: "application/json" });
      await uploadStorageFile(file, "configuracoes");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_gallery_settings"] });
      toast.success("Textos da galeria atualizados!");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar Galeria: " + (err.message || "Erro desconhecido"));
    }
  });
};

export const useGalleryImages = (onlyActive: boolean = true) => {
  return useQuery({
    queryKey: ["site_gallery_images", onlyActive],
    queryFn: async (): Promise<GalleryImage[]> => {
      try {
        let query = supabase.from("art_details_images").select("*").order("display_order", { ascending: true });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (error || !data) return [];
        return data as GalleryImage[];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

const callAdminData = async (body: Record<string, unknown>) =>
  invokeAdminData<{ data?: unknown }>({ ...body, resource: "art_details_images" });

export const useAddGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GalleryImage) => {
      const res = await callAdminData({ action: "create", payload: data });
      return res?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] }),
  });
};

export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GalleryImage> }) => {
      const res = await callAdminData({ action: "update", id, payload: data });
      return res?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] }),
  });
};

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await callAdminData({ action: "delete", id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] }),
  });
};
