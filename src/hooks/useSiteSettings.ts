import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invokeAdminData } from "@/utils/adminApi";
import { applyDynamicTheme } from "@/utils/themeUtils";
import { useEffect } from "react";

export interface AboutFeature {
  id: string;
  icon: string;
  title: string;
  desc: string;
  active: boolean;
  order: number;
}

export interface AboutStat {
  id: string;
  value: string;
  suffix: string;
  label: string;
  active: boolean;
  order: number;
}

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
  about_text?: string | null;
  about_header_image?: string | null;
  about_header_badge?: string | null;
  about_header_title_1?: string | null;
  about_header_title_2?: string | null;
  about_mission?: string | null;
  about_vision?: string | null;
  about_features?: AboutFeature[];
  about_stats?: AboutStat[];
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
  whatsapp: "(51) 99120-5664",
  phone: "(51) 99120-5664",
  instagram: "https://www.instagram.com/festanca.decoracoes",
  facebook: "https://www.facebook.com/share/1C2VPeVVFx/",
  tiktok: "https://www.tiktok.com/@festanca.decoracoes",
  address: "Av. Frederico Dihl, 3408 – Alvorada/RS | Bairro: Aparecida – CEP: 94853-250",
  footer_text: "Festança Decorações. Todos os direitos reservados.",
  about_text: "Nascemos do desejo de transformar momentos especiais em memórias inesquecíveis.\nDesde 2020, ajudamos centenas de famílias a celebrar com elegância, criatividade e muito carinho.",
  about_header_badge: "Nossa História",
  about_header_title_1: "Sobre a",
  about_header_title_2: "Festança",
  about_mission: "Democratizar o acesso a decorações de eventos premium através do aluguel. Acreditamos que todos merecem celebrar com sofisticação, sem comprometer o orçamento.",
  about_vision: "Ser a referência em locação de decoração para eventos no Brasil, reconhecida pela qualidade, inovação e excelência no atendimento.",
  about_features: [
    { id: "feat1", icon: "Heart", title: "Feito com Amor", desc: "Cada detalhe é pensado com carinho para tornar seu evento único e inesquecível.", active: true, order: 1 },
    { id: "feat2", icon: "Award", title: "Qualidade Premium", desc: "Trabalhamos apenas com materiais de alta qualidade para garantir elegância em cada peça.", active: true, order: 2 },
    { id: "feat3", icon: "Users", title: "Atendimento Personalizado", desc: "Nossa equipe está pronta para entender suas necessidades e criar o cenário perfeito.", active: true, order: 3 },
    { id: "feat4", icon: "Sparkles", title: "Criatividade Sem Limites", desc: "Transformamos ideias em realidade com temas exclusivos e decorações originais.", active: true, order: 4 }
  ],
  about_stats: [
    { id: "stat1", value: "5.600", suffix: "+", label: "Eventos Realizados", active: true, order: 1 },
    { id: "stat2", value: "200", suffix: "+", label: "Peças no Catálogo", active: true, order: 2 },
    { id: "stat3", value: "98", suffix: "%", label: "Clientes Satisfeitos", active: true, order: 3 },
    { id: "stat4", value: "4", suffix: "+", label: "Anos de Experiência", active: true, order: 4 }
  ]
};

export const useSiteSettings = () => {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings> => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "default")
          .maybeSingle();

        if (error || !data) {
          applyDynamicTheme(DEFAULT_SITE_SETTINGS.primary_color, DEFAULT_SITE_SETTINGS.secondary_color);
          return DEFAULT_SITE_SETTINGS;
        }

        const settings: SiteSettings = {
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
          about_text: data.about_text || DEFAULT_SITE_SETTINGS.about_text,
          about_header_image: data.about_header_image || DEFAULT_SITE_SETTINGS.about_header_image,
          about_header_badge: data.about_header_badge || DEFAULT_SITE_SETTINGS.about_header_badge,
          about_header_title_1: data.about_header_title_1 || DEFAULT_SITE_SETTINGS.about_header_title_1,
          about_header_title_2: data.about_header_title_2 || DEFAULT_SITE_SETTINGS.about_header_title_2,
          about_mission: data.about_mission || DEFAULT_SITE_SETTINGS.about_mission,
          about_vision: data.about_vision || DEFAULT_SITE_SETTINGS.about_vision,
          about_features: (data.about_features as unknown as AboutFeature[]) || DEFAULT_SITE_SETTINGS.about_features,
          about_stats: (data.about_stats as unknown as AboutStat[]) || DEFAULT_SITE_SETTINGS.about_stats,
          updated_at: data.updated_at,
        };

        applyDynamicTheme(settings.primary_color, settings.secondary_color);
        return settings;
      } catch {
        applyDynamicTheme(DEFAULT_SITE_SETTINGS.primary_color, DEFAULT_SITE_SETTINGS.secondary_color);
        return DEFAULT_SITE_SETTINGS;
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (query.data) {
      applyDynamicTheme(query.data.primary_color, query.data.secondary_color);
    }
  }, [query.data]);

  return query;
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
    onSuccess: (data) => {
      if (data) {
        applyDynamicTheme(data.primary_color, data.secondary_color);
      }
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
};
