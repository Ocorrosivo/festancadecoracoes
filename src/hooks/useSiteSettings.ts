import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invokeAdminData } from "@/utils/adminApi";

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  site_name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok?: string;
  address: string;
  footer_text: string;
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "default",
  logo_url: null,
  favicon_url: null,
  site_name: "Festança Decorações",
  description: "Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.",
  primary_color: "#ff4f9a",
  secondary_color: "#111827",
  whatsapp: "5511999999999",
  phone: "(11) 99999-9999",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
  address: "São Paulo - SP",
  footer_text: "Festança Decorações. Todos os direitos reservados.",
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings> => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "default")
          .maybeSingle();

        if (error || !data) {
          return DEFAULT_SITE_SETTINGS;
        }

        return {
          id: data.id,
          logo_url: data.logo_url,
          favicon_url: data.favicon_url,
          site_name: data.site_name || DEFAULT_SITE_SETTINGS.site_name,
          description: data.description || DEFAULT_SITE_SETTINGS.description,
          primary_color: data.primary_color || DEFAULT_SITE_SETTINGS.primary_color,
          secondary_color: data.secondary_color || DEFAULT_SITE_SETTINGS.secondary_color,
          whatsapp: data.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
          phone: data.phone || DEFAULT_SITE_SETTINGS.phone,
          instagram: data.instagram || DEFAULT_SITE_SETTINGS.instagram,
          facebook: data.facebook || DEFAULT_SITE_SETTINGS.facebook,
          tiktok: ((data as Record<string, unknown>).tiktok as string | undefined) || DEFAULT_SITE_SETTINGS.tiktok,
          address: data.address || DEFAULT_SITE_SETTINGS.address,
          footer_text: data.footer_text || DEFAULT_SITE_SETTINGS.footer_text,
          updated_at: data.updated_at,
        };
      } catch {
        return DEFAULT_SITE_SETTINGS;
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      const data = await invokeAdminData<{ data?: SiteSettings }>({
        resource: "site_settings",
        action: "upsert",
        payload: settings,
      });
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
};
