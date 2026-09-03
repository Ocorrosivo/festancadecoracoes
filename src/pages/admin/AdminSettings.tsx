import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save, Upload, Loader2, Palette, Phone, Info, Home,
  Plus, Trash2, Image as ImageIcon, Globe, AlignJustify,
  ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  ArrowUp, ArrowDown, Type, PenLine, FileText, LayoutTemplate,

  // Common icons for picker
  Heart, Star, Award, Shield, Users, Check, Sparkles, Smile, Target, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { useFaqs, useUpdateFaqs, type FaqItem } from "@/hooks/useFaqs";
import {
  useGallerySettings, useUpdateGallerySettings,
  useGalleryImages, type GalleryImage, type GallerySettings
} from "@/hooks/useGallery";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { invokeAdminData } from "@/utils/adminApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Tab definitions ───────────────────────────────────────────────────────
const TABS = [
  { id: "identidade", label: "Identidade Visual", icon: Palette },
  { id: "home",       label: "Página Home",       icon: Home },
  { id: "sobre",      label: "Sobre Nós",         icon: Info },
  { id: "contato",    label: "Contato e Redes",   icon: Phone },
  { id: "rodape",     label: "Rodapé",            icon: AlignJustify },
  { id: "seo",        label: "SEO e Técnico",     icon: Globe },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Shared Components ──────────────────────────────────────────────────────
const Block = ({
  title, icon: Icon, defaultOpen = true, children
}: { title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-primary" />
          <span className="font-bold text-base">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 space-y-5">{children}</div>}
    </div>
  );
};

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-1.5">
    <label className="text-sm font-medium text-foreground">{children}</label>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

// ─── Icon Picker ────────────────────────────────────────────────────────────
const ICONS = [
  { name: "Heart", icon: Heart }, { name: "Star", icon: Star },
  { name: "Award", icon: Award }, { name: "Shield", icon: Shield },
  { name: "Users", icon: Users }, { name: "Check", icon: Check },
  { name: "Sparkles", icon: Sparkles }, { name: "Smile", icon: Smile },
  { name: "Target", icon: Target }, { name: "Zap", icon: Zap }
];

const IconPicker = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {ICONS.map(({ name, icon: IconComponent }) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
            value === name ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-muted-foreground hover:bg-accent"
          }`}
          title={name}
        >
          <IconComponent size={20} />
        </button>
      ))}
      <Input
        className="w-32 h-10 ml-2"
        placeholder="Outro (nome)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

// ─── Compact Card for Lists ────────────────────────────────────────────────
interface CompactCardProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const CompactCard = ({ title, isExpanded, onToggle, onMoveUp, onMoveDown, onDelete, isFirst, isLast, children }: CompactCardProps) => {
  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden">
      {/* Header Summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors">
        <button type="button" onClick={onToggle} className="flex-1 flex items-center text-left font-medium text-sm truncate pr-4">
          {isExpanded ? <ChevronDown size={16} className="mr-2 shrink-0 text-muted-foreground" /> : <ChevronRight size={16} className="mr-2 shrink-0 text-muted-foreground" />}
          {title || "Novo Item"}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onMoveUp} disabled={isFirst}>
            <ArrowUp size={14} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onMoveDown} disabled={isLast}>
            <ArrowDown size={14} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
            if (window.confirm("Remover este item? O item será excluído do banco apenas após Salvar.")) onDelete();
          }}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      {/* Expanded Content */}
      {isExpanded && <div className="p-4 border-t border-border space-y-4">{children}</div>}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const { data: faqsData } = useFaqs(false);
  const updateFaqs = useUpdateFaqs();

  const { data: gallerySettingsData } = useGallerySettings();
  const updateGallerySettings = useUpdateGallerySettings();

  const { data: galleryImagesData } = useGalleryImages(false);

  const updateGalleryImages = useMutation({
    mutationFn: async (images: any[]) => {
      await invokeAdminData({ action: "upsert_all", payload: images, resource: "art_details_images" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] }),
  });

  const logoInputRef         = useRef<HTMLInputElement>(null);
  const faviconInputRef      = useRef<HTMLInputElement>(null);
  const aboutHeaderInputRef  = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>("identidade");

  // Expanded card tracking
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

  const [form, setForm] = useState({
    logo_url:             "",
    favicon_url:          "",
    primary_color:        "#ff4f9a",
    secondary_color:      "#111827",
    about_text:           "",
    about_header_image:   "",
    about_header_badge:   "",
    about_header_title_1: "",
    about_header_title_2: "",
    mission_title:        "",
    about_mission:        "",
    vision_title:         "",
    about_vision:         "",
    about_features:       [] as any[],
    about_stats:          [] as any[],
    whatsapp:             "",
    phone:                "",
    instagram:            "",
    facebook:             "",
    tiktok:               "",
    address:              "",
    footer_text:          "",
    site_name:            "",
    description:          "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [faqList, setFaqList]                         = useState<FaqItem[]>([]);
  const [galleryForm, setGalleryForm]                 = useState<GallerySettings>({ title: "", quote: "" });
  const [galleryImages, setGalleryImages]             = useState<GalleryImage[]>([]);
  
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo]             = useState(false);
  const [uploadingFavicon, setUploadingFavicon]       = useState(false);
  const [uploadingAboutHeader, setUploadingAboutHeader] = useState(false);

  // Initialize data
  useEffect(() => {
    if (settings && !isDirty) { // Only update if not dirty, to prevent losing data when toggling tabs if queries refetch
      setForm({
        logo_url:             settings.logo_url            || "",
        favicon_url:          settings.favicon_url         || "",
        primary_color:        settings.primary_color       || "#ff4f9a",
        secondary_color:      settings.secondary_color     || "#111827",
        about_text:           settings.about_text          || "",
        about_header_image:   settings.about_header_image  || "",
        about_header_badge:   settings.about_header_badge  || "",
        about_header_title_1: settings.about_header_title_1|| "",
        about_header_title_2: settings.about_header_title_2|| "",
        mission_title:        settings.mission_title       || "",
        about_mission:        settings.about_mission       || "",
        vision_title:         settings.vision_title        || "",
        about_vision:         settings.about_vision        || "",
        about_features:       settings.about_features      || [],
        about_stats:          settings.about_stats         || [],
        whatsapp:             settings.whatsapp            || "",
        phone:                settings.phone               || "",
        instagram:            settings.instagram           || "",
        facebook:             settings.facebook            || "",
        tiktok:               settings.tiktok              || "",
        address:              settings.address             || "",
        footer_text:          settings.footer_text         || "",
        site_name:            settings.site_name           || "",
        description:          settings.description         || "",
      });
    }
  }, [settings]);

  useEffect(() => { if (faqsData && !isDirty) setFaqList(faqsData); }, [faqsData]);
  useEffect(() => { if (gallerySettingsData && !isDirty) setGalleryForm(gallerySettingsData); }, [gallerySettingsData]);
  useEffect(() => { if (galleryImagesData && !isDirty) setGalleryImages(galleryImagesData); }, [galleryImagesData]);

  const setField = useCallback((patch: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  }, []);

  // Prevent accidental navigation when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Array reordering helpers
  const moveItem = <T,>(array: T[], index: number, direction: 1 | -1, setter: (val: T[]) => void) => {
    if (index + direction < 0 || index + direction >= array.length) return;
    const newArr = [...array];
    const temp = newArr[index];
    newArr[index] = newArr[index + direction];
    newArr[index + direction] = temp;
    
    // Update display_order / order if the objects have them
    const fixedArr = newArr.map((item: any, i) => {
      if ('order' in item) return { ...item, order: i + 1 };
      if ('display_order' in item) return { ...item, display_order: i + 1 };
      return item;
    });
    
    setter(fixedArr);
    setIsDirty(true);
  };

  // ── Upload handlers ────────────────────────────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadStorageFile(file, "logos");
      setField({ logo_url: url });
      toast.success("Logo enviada!");
    } catch { toast.error("Erro ao enviar logo."); }
    finally { setUploadingLogo(false); }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadStorageFile(file, "favicon");
      setField({ favicon_url: url });
      toast.success("Favicon enviado!");
    } catch { toast.error("Erro ao enviar favicon."); }
    finally { setUploadingFavicon(false); }
  };

  const handleAboutHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutHeader(true);
    try {
      const url = await uploadStorageFile(file, "banners");
      setField({ about_header_image: url });
      toast.success("Imagem enviada!");
    } catch { toast.error("Erro ao enviar imagem."); }
    finally { setUploadingAboutHeader(false); }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryIdx(index);
    try {
      const url = await uploadStorageFile(file, "banners");
      const imgs = [...galleryImages];
      if (imgs[index]) {
        imgs[index].image_url = url;
      } else {
        imgs[index] = { image_url: url, image_alt: "Imagem da galeria", title: "", display_order: index, is_active: true };
      }
      setGalleryImages(imgs);
      setIsDirty(true);
      toast.success("Imagem enviada!");
    } catch { toast.error("Erro ao enviar imagem."); }
    finally { setUploadingGalleryIdx(null); }
  };

  // ── Submit by Tab ──────────────────────────────────────────────────────
  const handleSaveTab = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const promises: Promise<any>[] = [];

      // Always save site_settings as our single upsert covers it. 
      // It includes changes made ONLY in the active tab (since other tabs' fields are preserved in state).
      promises.push(updateSettings.mutateAsync(form));

      // ONLY save external tables if we are on the Home tab (where they are edited).
      if (activeTab === "home") {
        promises.push(updateFaqs.mutateAsync(faqList));
        promises.push(updateGallerySettings.mutateAsync(galleryForm));
        promises.push(updateGalleryImages.mutateAsync(galleryImages));
      }

      await Promise.all(promises);
      
      // Force cache invalidation
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      if (activeTab === "home") {
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        queryClient.invalidateQueries({ queryKey: ["site_gallery_settings"] });
        queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] });
      }

      setIsDirty(false);
      toast.success("Alterações salvas com sucesso!");
    } catch (err) {
      const e = err as { message?: string };
      console.error(`[AdminSettings] falha ao salvar aba ${activeTab}:`, e?.message ?? err);
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Render a specific Save button for the active tab
  const SaveTabButton = ({ size = "default" }: { size?: "default" | "lg" }) => {
    const tabLabel = TABS.find(t => t.id === activeTab)?.label || "";
    return (
      <Button
        type="button" // important to not trigger full form submit implicitly
        onClick={handleSaveTab}
        disabled={isSaving}
        className={`gap-2 rounded-xl shadow-md ${size === "lg" ? "w-full sm:w-auto px-10 py-6 text-base font-bold" : ""}`}
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Salvar {tabLabel}
      </Button>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />

        {/* ── Sticky header ── */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground hidden md:block">Painel / <span className="text-foreground">Configurações do Site</span></p>
            <h1 className="text-lg font-heading font-bold text-foreground truncate">Configurações Globais</h1>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} />
                Não salvas
              </span>
            )}
            <SaveTabButton />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar tabs (desktop) ── */}
          <nav className="hidden md:flex flex-col w-56 border-r border-border bg-card/50 py-4 px-2 gap-1 shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ── Mobile tabs (horizontal scroll) ── */}
          <div className="md:hidden flex border-b border-border bg-card/50 px-3 py-2 gap-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-muted-foreground bg-accent/50 hover:bg-accent"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Content area ── */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="pb-12 max-w-3xl">
                {/* ═══════════════════════════════════════════════════════
                    TAB 1 — IDENTIDADE VISUAL
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "identidade" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Block title="Logo do Site" icon={ImageIcon}>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] bg-background/50">
                        {form.logo_url ? (
                          <img src={form.logo_url} alt="Logo" className="max-h-24 object-contain rounded-lg mb-4 shadow-sm" />
                        ) : (
                          <p className="text-sm text-muted-foreground mb-4">Nenhuma logo enviada</p>
                        )}
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        <Button type="button" variant="outline" disabled={uploadingLogo} onClick={() => logoInputRef.current?.click()} className="gap-2">
                          {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          {form.logo_url ? "Alterar Logo" : "Enviar Logo"}
                        </Button>
                      </div>
                    </Block>

                    <Block title="Favicon (Ícone da guia)" icon={Globe} defaultOpen={false}>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[140px] bg-background/50">
                        {form.favicon_url ? (
                          <img src={form.favicon_url} alt="Favicon" className="w-12 h-12 object-contain rounded-lg mb-4 shadow-sm" />
                        ) : (
                          <p className="text-sm text-muted-foreground mb-4">Nenhum favicon enviado</p>
                        )}
                        <input ref={faviconInputRef} type="file" accept="image/*,.ico" className="hidden" onChange={handleFaviconUpload} />
                        <Button type="button" variant="outline" disabled={uploadingFavicon} onClick={() => faviconInputRef.current?.click()} className="gap-2">
                          {uploadingFavicon ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          {form.favicon_url ? "Alterar Favicon" : "Enviar Favicon"}
                        </Button>
                      </div>
                    </Block>

                    <Block title="Cores Principais" icon={Palette}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <Label>Cor Primária (Destaques e Botões)</Label>
                          <div className="flex gap-3 items-center mt-1">
                            <input type="color" value={form.primary_color}
                              onChange={e => setField({ primary_color: e.target.value })}
                              className="w-12 h-12 rounded-xl border border-border cursor-pointer shrink-0" />
                            <Input value={form.primary_color} onChange={e => setField({ primary_color: e.target.value })}
                              placeholder="#ff4f9a" className="font-mono" />
                          </div>
                          <div className="mt-3 h-4 rounded-full w-full shadow-inner" style={{ background: form.primary_color }} />
                        </div>
                        <div>
                          <Label>Cor Secundária (Textos Escuros)</Label>
                          <div className="flex gap-3 items-center mt-1">
                            <input type="color" value={form.secondary_color}
                              onChange={e => setField({ secondary_color: e.target.value })}
                              className="w-12 h-12 rounded-xl border border-border cursor-pointer shrink-0" />
                            <Input value={form.secondary_color} onChange={e => setField({ secondary_color: e.target.value })}
                              placeholder="#111827" className="font-mono" />
                          </div>
                          <div className="mt-3 h-4 rounded-full w-full shadow-inner" style={{ background: form.secondary_color }} />
                        </div>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 2 — PÁGINA HOME
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "home" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <Button type="button" variant="outline" asChild className="flex-1 bg-card hover:bg-accent border-border shadow-sm">
                        <Link to="/admin/banner"><ImageIcon size={16} className="mr-2 text-primary" /> Gerenciar Banner Home</Link>
                      </Button>
                      <Button type="button" variant="outline" asChild className="flex-1 bg-card hover:bg-accent border-border shadow-sm">
                        <Link to="/admin/categories"><LayoutTemplate size={16} className="mr-2 text-primary" /> Gerenciar Categorias</Link>
                      </Button>
                      <Button type="button" variant="outline" asChild className="flex-1 bg-card hover:bg-accent border-border shadow-sm">
                        <Link to="/admin/products"><Globe size={16} className="mr-2 text-primary" /> Gerenciar Produtos</Link>
                      </Button>
                    </div>

                    <Block title="Texto Institucional Curto" icon={FileText}>
                      <Label hint="Resumo exibido logo abaixo do banner na Home.">
                        Quem Somos (Resumo)
                      </Label>
                      <Textarea rows={4} value={form.about_text}
                        onChange={e => setField({ about_text: e.target.value })}
                        className="resize-none"
                        placeholder="Nascemos do desejo de transformar momentos especiais..." />
                    </Block>

                    <Block title="Seção Galeria - Nossa Arte em Detalhes" icon={ImageIcon}>
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label hint="Use *asteriscos* para destacar em rosa e itálico.">
                              Título Principal
                            </Label>
                            <Input value={galleryForm.title}
                              onChange={e => { setGalleryForm({ ...galleryForm, title: e.target.value }); setIsDirty(true); }}
                              placeholder="Nossa *Arte em Detalhes*" />
                          </div>
                          <div>
                            <Label hint="Frase de apoio ou citação logo abaixo do título.">
                              Subtítulo
                            </Label>
                            <Textarea rows={2} value={galleryForm.quote}
                              onChange={e => { setGalleryForm({ ...galleryForm, quote: e.target.value }); setIsDirty(true); }}
                              className="resize-none"
                              placeholder="Transformamos espaços em experiências inesquecíveis..." />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Label>Imagens da Galeria Home (Mínimo recomendado: 4 imagens quadradas)</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            {[0, 1, 2, 3].map(idx => {
                              const img = galleryImages[idx];
                              const busy = uploadingGalleryIdx === idx;
                              return (
                                <div key={idx} className="space-y-3 p-3 bg-accent/20 rounded-xl border border-border">
                                  <div className="aspect-square border border-border rounded-lg overflow-hidden group relative bg-background">
                                    {img?.image_url
                                      ? <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                      : <div className="w-full h-full flex items-center justify-center bg-accent/30"><p className="text-xs text-muted-foreground">Vazio</p></div>
                                    }
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-center justify-center">
                                      <label className="cursor-pointer text-white bg-primary/80 hover:bg-primary px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {img?.image_url ? 'Trocar' : 'Enviar'}
                                        <input type="file" accept="image/*" className="hidden"
                                          onChange={e => handleGalleryImageUpload(e, idx)} disabled={busy} />
                                      </label>
                                      {img?.image_url && (
                                        <button type="button" onClick={() => {
                                          const imgs = [...galleryImages];
                                          imgs[idx] = { image_url: "", image_alt: "", title: "", display_order: idx, is_active: true };
                                          setGalleryImages(imgs); setIsDirty(true);
                                        }} className="text-white bg-destructive/80 hover:bg-destructive px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                                          <Trash2 size={14} /> Remover
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Legenda / Título</span>
                                      <Input className="h-8 text-xs bg-background" value={img?.title || ""} placeholder="Ex: Aniversário 15 Anos"
                                        onChange={e => {
                                          const imgs = [...galleryImages];
                                          if (!imgs[idx]) imgs[idx] = { image_url: "", image_alt: "", title: "", display_order: idx, is_active: true };
                                          imgs[idx].title = e.target.value;
                                          setGalleryImages(imgs); setIsDirty(true);
                                        }} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Block>

                    <Block title="Perguntas Frequentes (FAQ)" icon={Info} defaultOpen={false}>
                      <div className="space-y-3">
                        {faqList.map((faq, index) => (
                          <CompactCard
                            key={index}
                            title={faq.question || "Nova Pergunta"}
                            isExpanded={expandedFaq === index}
                            onToggle={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            onMoveUp={() => moveItem(faqList, index, -1, (l) => setFaqList(l as FaqItem[]))}
                            onMoveDown={() => moveItem(faqList, index, 1, (l) => setFaqList(l as FaqItem[]))}
                            onDelete={() => { setFaqList(faqList.filter((_, i) => i !== index)); setIsDirty(true); }}
                            isFirst={index === 0}
                            isLast={index === faqList.length - 1}
                          >
                            <div className="space-y-4">
                              <div>
                                <Label>Pergunta</Label>
                                <Input value={faq.question} onChange={e => {
                                  const l = [...faqList]; l[index].question = e.target.value;
                                  setFaqList(l); setIsDirty(true);
                                }} placeholder="Ex: Como funciona o aluguel?" />
                              </div>
                              <div>
                                <Label>Resposta Completa</Label>
                                <Textarea rows={3} value={faq.answer} onChange={e => {
                                  const l = [...faqList]; l[index].answer = e.target.value;
                                  setFaqList(l); setIsDirty(true);
                                }} placeholder="Descreva os detalhes..." />
                              </div>
                            </div>
                          </CompactCard>
                        ))}
                        <Button type="button" variant="outline" className="w-full gap-2 border-dashed bg-background"
                          onClick={() => { 
                            setFaqList([...faqList, { question: "", answer: "" }]); 
                            setExpandedFaq(faqList.length);
                            setIsDirty(true); 
                          }}>
                          <Plus size={16} /> Adicionar Nova Pergunta
                        </Button>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 3 — SOBRE NÓS
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "sobre" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Block title="Cabeçalho e História" icon={ImageIcon}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Imagem do Cabeçalho (Hero)</Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-background">
                            {form.about_header_image
                              ? <img src={form.about_header_image} alt="Cabeçalho Sobre" className="h-20 object-cover rounded-lg mb-3 w-full" />
                              : <p className="text-xs text-muted-foreground mb-3 text-center">Nenhuma imagem definida.<br/>(Usará a logo do site como fallback)</p>
                            }
                            <input ref={aboutHeaderInputRef} type="file" accept="image/*" className="hidden" onChange={handleAboutHeaderUpload} />
                            <Button type="button" variant="outline" size="sm" disabled={uploadingAboutHeader} onClick={() => aboutHeaderInputRef.current?.click()} className="gap-2">
                              {uploadingAboutHeader ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {form.about_header_image ? "Trocar Imagem" : "Enviar Imagem"}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label hint="Selo pequeno exibido acima do título.">Badge / Selo</Label>
                            <Input value={form.about_header_badge} onChange={e => setField({ about_header_badge: e.target.value })} placeholder="Ex: Nossa História" />
                          </div>
                          <div>
                            <Label>Título - Parte 1 (Normal)</Label>
                            <Input value={form.about_header_title_1} onChange={e => setField({ about_header_title_1: e.target.value })} placeholder="Ex: Sobre a" />
                          </div>
                          <div>
                            <Label hint="Ficará com a cor primária do site.">Título - Parte 2 (Destacada)</Label>
                            <Input value={form.about_header_title_2} onChange={e => setField({ about_header_title_2: e.target.value })} placeholder="Ex: Festança" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-border">
                        <Label hint="O texto da história completa exibido na página (parágrafos e quebras de linha são respeitados).">
                          Texto "Quem Somos"
                        </Label>
                        <Textarea rows={8} value={form.about_text} onChange={e => setField({ about_text: e.target.value })} placeholder="Conte a história completa da empresa..." />
                      </div>
                    </Block>

                    <Block title="Missão e Visão" icon={Target} defaultOpen={false}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 bg-accent/20 p-5 rounded-xl border border-border">
                          <div>
                            <Label>Título da Missão</Label>
                            <Input value={form.mission_title} onChange={e => setField({ mission_title: e.target.value })} placeholder="Ex: Nossa Missão" className="bg-background" />
                          </div>
                          <div>
                            <Label>Texto da Missão</Label>
                            <Textarea rows={4} value={form.about_mission} onChange={e => setField({ about_mission: e.target.value })} placeholder="O que a empresa busca realizar no dia a dia..." className="bg-background resize-none" />
                          </div>
                        </div>
                        <div className="space-y-4 bg-accent/20 p-5 rounded-xl border border-border">
                          <div>
                            <Label>Título da Visão</Label>
                            <Input value={form.vision_title} onChange={e => setField({ vision_title: e.target.value })} placeholder="Ex: Nossa Visão" className="bg-background" />
                          </div>
                          <div>
                            <Label>Texto da Visão</Label>
                            <Textarea rows={4} value={form.about_vision} onChange={e => setField({ about_vision: e.target.value })} placeholder="Aonde a empresa quer chegar no futuro..." className="bg-background resize-none" />
                          </div>
                        </div>
                      </div>
                    </Block>

                    <Block title="Diferenciais (Por Que Escolher a Festança?)" icon={Star} defaultOpen={false}>
                      <div className="space-y-3">
                        {form.about_features.map((feat: any, index: number) => (
                          <CompactCard
                            key={index}
                            title={feat.title || "Novo Diferencial"}
                            isExpanded={expandedFeature === index}
                            onToggle={() => setExpandedFeature(expandedFeature === index ? null : index)}
                            onMoveUp={() => moveItem(form.about_features, index, -1, (l) => setField({ about_features: l }))}
                            onMoveDown={() => moveItem(form.about_features, index, 1, (l) => setField({ about_features: l }))}
                            onDelete={() => { setField({ about_features: form.about_features.filter((_: any, i: number) => i !== index) }); }}
                            isFirst={index === 0}
                            isLast={index === form.about_features.length - 1}
                          >
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Ícone</Label>
                                  <IconPicker 
                                    value={feat.icon} 
                                    onChange={(val) => {
                                      const nf = [...form.about_features]; nf[index].icon = val;
                                      setField({ about_features: nf });
                                    }} 
                                  />
                                </div>
                                <div>
                                  <Label>Título do Diferencial</Label>
                                  <Input value={feat.title} onChange={e => {
                                    const nf = [...form.about_features]; nf[index].title = e.target.value;
                                    setField({ about_features: nf });
                                  }} placeholder="Ex: Feito com Amor" />
                                </div>
                              </div>
                              <div>
                                <Label>Descrição Curta</Label>
                                <Textarea rows={2} value={feat.desc} onChange={e => {
                                  const nf = [...form.about_features]; nf[index].desc = e.target.value;
                                  setField({ about_features: nf });
                                }} placeholder="Explique rapidamente este diferencial..." className="resize-none" />
                              </div>
                            </div>
                          </CompactCard>
                        ))}
                        <Button type="button" variant="outline" className="w-full gap-2 border-dashed bg-background"
                          onClick={() => {
                            setField({ about_features: [...form.about_features, { id: `feat${Date.now()}`, icon: "Star", title: "", desc: "", active: true, order: form.about_features.length + 1 }] });
                            setExpandedFeature(form.about_features.length);
                          }}>
                          <Plus size={16} /> Adicionar Diferencial
                        </Button>
                      </div>
                    </Block>

                    <Block title="Indicadores (Nossos Números)" icon={Check} defaultOpen={false}>
                      <div className="space-y-3">
                        {form.about_stats.map((stat: any, index: number) => (
                          <CompactCard
                            key={index}
                            title={stat.label ? `${stat.value}${stat.suffix} ${stat.label}` : "Novo Indicador"}
                            isExpanded={expandedStat === index}
                            onToggle={() => setExpandedStat(expandedStat === index ? null : index)}
                            onMoveUp={() => moveItem(form.about_stats, index, -1, (l) => setField({ about_stats: l }))}
                            onMoveDown={() => moveItem(form.about_stats, index, 1, (l) => setField({ about_stats: l }))}
                            onDelete={() => { setField({ about_stats: form.about_stats.filter((_: any, i: number) => i !== index) }); }}
                            isFirst={index === 0}
                            isLast={index === form.about_stats.length - 1}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label hint="O número em destaque. Ex: 500">Valor Numérico</Label>
                                <Input value={stat.value} onChange={e => {
                                  const ns = [...form.about_stats]; ns[index].value = e.target.value;
                                  setField({ about_stats: ns });
                                }} placeholder="Ex: 500" />
                              </div>
                              <div>
                                <Label hint="Símbolo que acompanha o número. Ex: + ou %">Sufixo (Opcional)</Label>
                                <Input value={stat.suffix} onChange={e => {
                                  const ns = [...form.about_stats]; ns[index].suffix = e.target.value;
                                  setField({ about_stats: ns });
                                }} placeholder="Ex: +" />
                              </div>
                              <div>
                                <Label hint="O texto descritivo. Ex: Eventos Realizados">Rótulo Descritivo</Label>
                                <Input value={stat.label} onChange={e => {
                                  const ns = [...form.about_stats]; ns[index].label = e.target.value;
                                  setField({ about_stats: ns });
                                }} placeholder="Ex: Eventos Realizados" />
                              </div>
                            </div>
                          </CompactCard>
                        ))}
                        <Button type="button" variant="outline" className="w-full gap-2 border-dashed bg-background"
                          onClick={() => {
                            setField({ about_stats: [...form.about_stats, { id: `stat${Date.now()}`, value: "0", suffix: "+", label: "", active: true, order: form.about_stats.length + 1 }] });
                            setExpandedStat(form.about_stats.length);
                          }}>
                          <Plus size={16} /> Adicionar Indicador
                        </Button>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 4 — CONTATO E REDES
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "contato" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Block title="Informações de Contato" icon={Phone}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <Label hint="Para onde os botões 'Falar no WhatsApp' irão direcionar.">WhatsApp Oficial</Label>
                          <MaskedInput mask="phone" value={form.whatsapp}
                            onAccept={(val: string) => setField({ whatsapp: val })}
                            placeholder="(11) 99999-9999" className="h-11" />
                        </div>
                        <div>
                          <Label hint="O número que será exibido nas páginas.">Telefone Visível</Label>
                          <MaskedInput mask="phone" value={form.phone}
                            onAccept={(val: string) => setField({ phone: val })}
                            placeholder="(11) 99999-9999" className="h-11" />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Endereço Físico ou Localização</Label>
                          <Input value={form.address}
                            onChange={e => setField({ address: e.target.value })}
                            placeholder="Ex: Av. Central, 1000 - São Paulo, SP" className="h-11" />
                        </div>
                      </div>
                    </Block>

                    <Block title="Perfis em Redes Sociais" icon={Globe}>
                      <div className="space-y-4">
                        <div className="flex rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-accent/40 border border-border border-r-0 flex items-center justify-center px-4 shrink-0 text-muted-foreground font-medium text-sm w-32">Instagram</div>
                          <Input value={form.instagram} onChange={e => setField({ instagram: e.target.value })} placeholder="https://instagram.com/..." className="rounded-none rounded-r-xl border-l-0 h-11" />
                        </div>
                        <div className="flex rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-accent/40 border border-border border-r-0 flex items-center justify-center px-4 shrink-0 text-muted-foreground font-medium text-sm w-32">Facebook</div>
                          <Input value={form.facebook} onChange={e => setField({ facebook: e.target.value })} placeholder="https://facebook.com/..." className="rounded-none rounded-r-xl border-l-0 h-11" />
                        </div>
                        <div className="flex rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-accent/40 border border-border border-r-0 flex items-center justify-center px-4 shrink-0 text-muted-foreground font-medium text-sm w-32">TikTok</div>
                          <Input value={form.tiktok} onChange={e => setField({ tiktok: e.target.value })} placeholder="https://tiktok.com/@..." className="rounded-none rounded-r-xl border-l-0 h-11" />
                        </div>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 5 — RODAPÉ
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "rodape" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Block title="Rodapé do Site" icon={AlignJustify}>
                      <div>
                        <Label hint="O texto exibido na faixa inferior indicando os direitos de copyright do site.">
                          Texto de Direitos Autorais (Copyright)
                        </Label>
                        <Textarea rows={2} value={form.footer_text}
                          onChange={e => setField({ footer_text: e.target.value })}
                          placeholder="Festança Decorações. Todos os direitos reservados." className="resize-none" />
                      </div>
                      <div className="mt-6 p-4 bg-accent/20 border border-border rounded-xl">
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Info size={16} className="text-primary"/> Informação</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Links padrão do rodapé como <strong>Política de Privacidade</strong>, <strong>Política de Reembolso</strong> e <strong>Fale Conosco</strong> já estão integrados ao layout fixo.
                          As informações de endereço e redes sociais exibidas no rodapé são carregadas da aba <strong>Contato e Redes</strong>.
                        </p>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 6 — SEO E TÉCNICO
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "seo" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Block title="Configurações SEO (Busca e Compartilhamento)" icon={Globe}>
                      <div className="space-y-6">
                        <div>
                          <Label hint="O nome global que aparece nas abas do navegador e no título das páginas em buscadores como Google.">
                            Nome Oficial do Site
                          </Label>
                          <Input value={form.site_name}
                            onChange={e => setField({ site_name: e.target.value })}
                            placeholder="Festança Decorações" className="h-11" />
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-1.5">
                            <label className="text-sm font-medium text-foreground">Descrição Global SEO</label>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${form.description.length > 160 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                              {form.description.length} caracteres
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Este texto é exibido abaixo do título no Google e nas prévias do WhatsApp. Recomendado entre 120 a 160 caracteres.
                            É independente do texto "Quem Somos".
                          </p>
                          <Textarea rows={4} value={form.description}
                            onChange={e => setField({ description: e.target.value })}
                            placeholder="Decorações completas para festas infantis, casamentos e eventos especiais. Atendemos com excelência e peças premium." className="resize-none text-base" />
                        </div>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ── Bottom save button ── */}
                <div className="mt-8 mb-12">
                  <SaveTabButton size="lg" />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
