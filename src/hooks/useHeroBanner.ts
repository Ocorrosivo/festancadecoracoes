import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroBanner {
  id?: string;
  desktop_image_url: string | null;
  tablet_image_url?: string | null;
  mobile_image_url: string | null;
  badge_text: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
  secondary_button_text?: string | null;
  secondary_button_link?: string | null;
  is_active: boolean;
}

export const DEFAULT_HERO_BANNER: HeroBanner = {
  desktop_image_url: null,
  tablet_image_url: null,
  mobile_image_url: null,
  badge_text: "✨ Você sonha, nós realizamos",
  title: "Festança Decorações",
  subtitle: "Momentos Mágicos, Memórias Inesquecíveis",
  description: "Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.",
  button_text: "Ver Catálogo",
  button_link: "/produtos",
  secondary_button_text: "WhatsApp",
  secondary_button_link: "",
  is_active: true,
};

export const useHeroBanner = () => {
  return useQuery({
    queryKey: ["hero_banner"],
    queryFn: async (): Promise<HeroBanner> => {
      try {
        const { data, error } = await supabase
          .from("hero_banners")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          return DEFAULT_HERO_BANNER;
        }

        return {
          id: data.id,
          desktop_image_url: data.desktop_image_url,
          tablet_image_url: ((data as Record<string, unknown>).tablet_image_url as string | null) || data.desktop_image_url,
          mobile_image_url: data.mobile_image_url,
          badge_text: data.badge_text || DEFAULT_HERO_BANNER.badge_text,
          title: data.title || DEFAULT_HERO_BANNER.title,
          subtitle: data.subtitle || DEFAULT_HERO_BANNER.subtitle,
          description: data.description || DEFAULT_HERO_BANNER.description,
          button_text: data.button_text || DEFAULT_HERO_BANNER.button_text,
          button_link: data.button_link || DEFAULT_HERO_BANNER.button_link,
          secondary_button_text: ((data as Record<string, unknown>).secondary_button_text as string | null) || DEFAULT_HERO_BANNER.secondary_button_text,
          secondary_button_link: ((data as Record<string, unknown>).secondary_button_link as string) || "",
          is_active: data.is_active ?? true,
        };
      } catch {
        return DEFAULT_HERO_BANNER;
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useUpdateHeroBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (banner: HeroBanner) => {
      const payload = {
        ...banner,
        updated_at: new Date().toISOString(),
      };

      if (banner.id) {
        const { data, error } = await supabase
          .from("hero_banners")
          .update(payload as Record<string, unknown>)
          .eq("id", banner.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("hero_banners")
          .insert([payload as Record<string, unknown>])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero_banner"] });
    },
  });
};
