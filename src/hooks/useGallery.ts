import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import gallery1 from "@/assets/gallery-1.webp";
import gallery2 from "@/assets/gallery-2.webp";
import gallery3 from "@/assets/gallery-3.webp";
import gallery4 from "@/assets/gallery-4.webp";

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface GallerySettings {
  title: string;
  quote: string;
  images: GalleryImage[];
}

export const DEFAULT_GALLERY: GallerySettings = {
  title: "Nossa *Arte em Detalhes*",
  quote: "\"Transformamos espaços em experiências inesquecíveis, cuidando de cada detalhe com amor e dedicação.\"",
  images: [
    { src: gallery1, alt: "Flores de casamento" },
    { src: gallery2, alt: "Festa de aniversário" },
    { src: gallery3, alt: "Jantar elegante" },
    { src: gallery4, alt: "Bolo de festa" },
  ]
};

export const useGallery = () => {
  return useQuery({
    queryKey: ["site_gallery"],
    queryFn: async (): Promise<GallerySettings> => {
      try {
        const { data } = supabase.storage.from("festanca-storage").getPublicUrl("configuracoes/gallery.json");
        const res = await fetch(`${data.publicUrl}?t=${Date.now()}`);
        if (!res.ok) {
          return DEFAULT_GALLERY;
        }
        const json = await res.json();
        return {
          title: json.title || DEFAULT_GALLERY.title,
          quote: json.quote || DEFAULT_GALLERY.quote,
          images: Array.isArray(json.images) && json.images.length > 0 ? json.images : DEFAULT_GALLERY.images
        };
      } catch (err) {
        return DEFAULT_GALLERY;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gallery: GallerySettings) => {
      const file = new File([JSON.stringify(gallery)], "gallery.json", { type: "application/json" });
      await uploadStorageFile(file, "configuracoes");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_gallery"] });
      toast.success("Galeria atualizada!");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar Galeria: " + (err.message || "Erro desconhecido"));
    }
  });
};
