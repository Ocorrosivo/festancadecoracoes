import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save, Upload, Loader2, Palette, Phone, Info, Home,
  Plus, Trash2, Image as ImageIcon, Globe, AlignJustify,
  ChevronDown, ChevronUp, ExternalLink, AlertCircle
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
  { id: "home",       label: "Página Home",        icon: Home },
  { id: "sobre",      label: "Sobre Nós",          icon: Info },
  { id: "contato",    label: "Contato e Redes",    icon: Phone },
  { id: "rodape",     label: "Rodapé",             icon: AlignJustify },
  { id: "seo",        label: "SEO e Técnico",      icon: Globe },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Collapsible block ──────────────────────────────────────────────────────
const Block = ({
  title, icon: Icon, defaultOpen = true, children
}: { title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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

// ─── Field label ────────────────────────────────────────────────────────────
const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-1.5">
    <label className="text-sm font-medium text-muted-foreground">{children}</label>
    {hint && <p className="text-xs text-muted-foreground/70 mt-0.5">{hint}</p>}
  </div>
);

// ─── Save button (shared) ───────────────────────────────────────────────────
const SaveButton = ({ isSaving, size = "default" }: { isSaving: boolean; size?: "default" | "lg" }) => (
  <Button
    type="submit"
    disabled={isSaving}
    className={`gap-2 rounded-xl shadow-md ${size === "lg" ? "w-full sm:w-auto px-10 py-6 text-base font-bold" : ""}`}
  >
    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
    Salvar Configurações
  </Button>
);

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

  // ── Refs for file inputs ───────────────────────────────────────────────
  const logoInputRef         = useRef<HTMLInputElement>(null);
  const faviconInputRef      = useRef<HTMLInputElement>(null);
  const aboutHeaderInputRef  = useRef<HTMLInputElement>(null);

  // ── Active tab ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("identidade");

  // ── Single shared form state ───────────────────────────────────────────
  const [form, setForm] = useState({
    // identidade
    logo_url:             "",
    favicon_url:          "",
    primary_color:        "#ff4f9a",
    secondary_color:      "#111827",
    // home
    about_text:           "",
    // sobre nós
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
    // contato
    whatsapp:             "",
    phone:                "",
    instagram:            "",
    facebook:             "",
    tiktok:               "",
    address:              "",
    // rodapé
    footer_text:          "",
    // seo
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

  // ── Populate form when data arrives ───────────────────────────────────
  useEffect(() => {
    if (settings) {
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
      setIsDirty(false);
    }
    if (faqsData)          setFaqList(faqsData);
    if (gallerySettingsData) setGalleryForm(gallerySettingsData);
    if (galleryImagesData)   setGalleryImages(galleryImagesData);
  }, [settings, faqsData, gallerySettingsData, galleryImagesData]);

  // Track dirty state on any form change
  const setField = useCallback((patch: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  }, []);

  // Warn on unload when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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

  // ── Submit: single Promise.all, single toast ───────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateSettings.mutateAsync(form),
        updateFaqs.mutateAsync(faqList),
        updateGallerySettings.mutateAsync(galleryForm),
        updateGalleryImages.mutateAsync(galleryImages),
      ]);
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      setIsDirty(false);
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      const e = err as { message?: string };
      console.error("[AdminSettings] falha ao salvar:", e?.message ?? err);
      toast.error("Não foi possível salvar as configurações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
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
            <h1 className="text-lg font-heading font-bold text-foreground truncate">Configurações do Site</h1>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} />
                Alterações não salvas
              </span>
            )}
            <Button onClick={handleSubmit} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span className="hidden sm:inline">Salvar</span>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar tabs (desktop) ── */}
          <nav className="hidden md:flex flex-col w-52 border-r border-border bg-card/50 py-4 px-2 gap-1 shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ── Mobile tabs (horizontal scroll) ── */}
          <div className="md:hidden flex border-b border-border bg-card/50 px-2 py-1.5 gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <tab.icon size={14} />
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
              <form onSubmit={handleSubmit}>
                {/* ═══════════════════════════════════════════════════════
                    TAB 1 — IDENTIDADE VISUAL
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "identidade" && (
                  <div className="space-y-6 max-w-3xl">
                    <Block title="Logo Principal" icon={ImageIcon}>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-background">
                        {form.logo_url ? (
                          <img src={form.logo_url} alt="Logo" className="max-h-24 object-contain rounded-lg mb-3" />
                        ) : (
                          <p className="text-xs text-muted-foreground mb-3">Nenhuma logo enviada</p>
                        )}
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        <Button type="button" variant="outline" size="sm" disabled={uploadingLogo}
                          onClick={() => logoInputRef.current?.click()} className="gap-2 text-xs rounded-lg">
                          {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {form.logo_url ? "Alterar Logo" : "Enviar Logo"}
                        </Button>
                      </div>
                    </Block>

                    <Block title="Favicon" icon={Globe} defaultOpen={false}>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] bg-background">
                        {form.favicon_url ? (
                          <img src={form.favicon_url} alt="Favicon" className="w-12 h-12 object-contain rounded-lg mb-3" />
                        ) : (
                          <p className="text-xs text-muted-foreground mb-3">Nenhum favicon enviado</p>
                        )}
                        <input ref={faviconInputRef} type="file" accept="image/*,.ico" className="hidden" onChange={handleFaviconUpload} />
                        <Button type="button" variant="outline" size="sm" disabled={uploadingFavicon}
                          onClick={() => faviconInputRef.current?.click()} className="gap-2 text-xs rounded-lg">
                          {uploadingFavicon ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {form.favicon_url ? "Alterar Favicon" : "Enviar Favicon"}
                        </Button>
                      </div>
                    </Block>

                    <Block title="Cores do Site" icon={Palette}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <Label>Cor Primária</Label>
                          <div className="flex gap-3 items-center">
                            <input type="color" value={form.primary_color}
                              onChange={e => setField({ primary_color: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0" />
                            <Input value={form.primary_color} onChange={e => setField({ primary_color: e.target.value })}
                              placeholder="#ff4f9a" className="font-mono text-sm" />
                          </div>
                          <div className="mt-2 h-3 rounded-full" style={{ background: form.primary_color }} />
                        </div>
                        <div>
                          <Label>Cor Secundária</Label>
                          <div className="flex gap-3 items-center">
                            <input type="color" value={form.secondary_color}
                              onChange={e => setField({ secondary_color: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0" />
                            <Input value={form.secondary_color} onChange={e => setField({ secondary_color: e.target.value })}
                              placeholder="#111827" className="font-mono text-sm" />
                          </div>
                          <div className="mt-2 h-3 rounded-full" style={{ background: form.secondary_color }} />
                        </div>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 2 — PÁGINA HOME
                    Ordem: Banner → Quem Somos → Categorias → Produtos →
                           Galeria Arte → FAQ
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "home" && (
                  <div className="space-y-6 max-w-3xl">
                    {/* Banner Home → módulo separado */}
                    <Block title="Banner Principal (Hero)" icon={ImageIcon}>
                      <p className="text-sm text-muted-foreground">
                        O banner da Home é gerenciado no módulo dedicado. Edite imagens, título, subtítulo e botões lá.
                      </p>
                      <Button type="button" variant="outline" size="sm" asChild className="gap-2 mt-1">
                        <Link to="/admin/banner">
                          <ExternalLink size={14} /> Abrir módulo Banner Home
                        </Link>
                      </Button>
                    </Block>

                    {/* Seção Quem Somos (About) */}
                    <Block title="Seção Quem Somos" icon={Info}>
                      <Label hint="Aparece logo abaixo do banner. Cada linha vira um parágrafo separado.">
                        Texto institucional
                      </Label>
                      <Textarea rows={7} value={form.about_text}
                        onChange={e => setField({ about_text: e.target.value })}
                        placeholder={"Nascemos do desejo de transformar momentos especiais em memórias inesquecíveis.\nDesde 2020, ajudamos centenas de famílias a celebrar com elegância, criatividade e muito carinho."} />
                    </Block>

                    {/* Categorias → módulo separado */}
                    <Block title="Categorias de Ocasião" icon={Globe} defaultOpen={false}>
                      <p className="text-sm text-muted-foreground">
                        As categorias são gerenciadas no módulo dedicado (nome, imagem, ordem).
                      </p>
                      <Button type="button" variant="outline" size="sm" asChild className="gap-2 mt-1">
                        <Link to="/admin/categories">
                          <ExternalLink size={14} /> Abrir módulo Categorias
                        </Link>
                      </Button>
                    </Block>

                    {/* Produtos → módulo separado */}
                    <Block title="Grade de Produtos" icon={Globe} defaultOpen={false}>
                      <p className="text-sm text-muted-foreground">
                        Produtos são gerenciados no módulo dedicado (nome, fotos, preço, categoria).
                      </p>
                      <Button type="button" variant="outline" size="sm" asChild className="gap-2 mt-1">
                        <Link to="/admin/products">
                          <ExternalLink size={14} /> Abrir módulo Produtos
                        </Link>
                      </Button>
                    </Block>

                    {/* Galeria "Nossa Arte em Detalhes" */}
                    <Block title="Seção Nossa Arte em Detalhes" icon={ImageIcon}>
                      <div className="space-y-4">
                        <div>
                          <Label hint='Use *asteriscos* ao redor do trecho que deve ficar em rosa e itálico. Ex: "Nossa *Arte em Detalhes*"'>
                            Título principal
                          </Label>
                          <Input value={galleryForm.title}
                            onChange={e => { setGalleryForm({ ...galleryForm, title: e.target.value }); setIsDirty(true); }}
                            placeholder="Nossa *Arte em Detalhes*" />
                        </div>
                        <div>
                          <Label>Subtítulo / citação</Label>
                          <Textarea rows={2} value={galleryForm.quote}
                            onChange={e => { setGalleryForm({ ...galleryForm, quote: e.target.value }); setIsDirty(true); }}
                            placeholder="Transformamos espaços em experiências inesquecíveis..." />
                        </div>

                        <div className="pt-3 border-t border-border">
                          <Label>Imagens da galeria (até 4)</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            {[0, 1, 2, 3].map(idx => {
                              const img = galleryImages[idx];
                              const busy = uploadingGalleryIdx === idx;
                              return (
                                <div key={idx} className="space-y-2">
                                  <div className="aspect-square border-2 border-dashed border-border rounded-xl overflow-hidden group relative bg-background">
                                    {img?.image_url
                                      ? <img src={img.image_url} alt={img.image_alt || ""} className="w-full h-full object-cover" />
                                      : <div className="w-full h-full flex items-center justify-center"><p className="text-xs text-muted-foreground text-center px-2">Sem imagem</p></div>
                                    }
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <label className="cursor-pointer text-white bg-black/50 p-2 rounded-full hover:bg-black/70">
                                        {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                                        <input type="file" accept="image/*" className="hidden"
                                          onChange={e => handleGalleryImageUpload(e, idx)} disabled={busy} />
                                      </label>
                                    </div>
                                  </div>
                                  <Input placeholder="Texto alternativo (Alt)" className="text-xs h-8"
                                    value={img?.image_alt || ""}
                                    onChange={e => {
                                      const imgs = [...galleryImages];
                                      if (!imgs[idx]) imgs[idx] = { image_url: "", image_alt: "", title: "", display_order: idx, is_active: true };
                                      imgs[idx].image_alt = e.target.value;
                                      setGalleryImages(imgs); setIsDirty(true);
                                    }} />
                                  <Input placeholder="Título (opcional)" className="text-xs h-8"
                                    value={img?.title || ""}
                                    onChange={e => {
                                      const imgs = [...galleryImages];
                                      if (!imgs[idx]) imgs[idx] = { image_url: "", image_alt: "", title: "", display_order: idx, is_active: true };
                                      imgs[idx].title = e.target.value;
                                      setGalleryImages(imgs); setIsDirty(true);
                                    }} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Block>

                    {/* FAQ */}
                    <Block title="Perguntas Frequentes (FAQ)" icon={Info} defaultOpen={false}>
                      <div className="space-y-4">
                        {faqList.map((faq, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-4 border border-border p-4 rounded-xl bg-background">
                            <div className="flex-1 space-y-3">
                              <div>
                                <Label>Pergunta</Label>
                                <Input value={faq.question}
                                  onChange={e => {
                                    const l = [...faqList]; l[index].question = e.target.value;
                                    setFaqList(l); setIsDirty(true);
                                  }}
                                  placeholder="Ex: Como funciona o aluguel?" />
                              </div>
                              <div>
                                <Label>Resposta</Label>
                                <Textarea rows={2} value={faq.answer}
                                  onChange={e => {
                                    const l = [...faqList]; l[index].answer = e.target.value;
                                    setFaqList(l); setIsDirty(true);
                                  }}
                                  placeholder="Resposta completa..." />
                              </div>
                            </div>
                            <div className="flex sm:flex-col justify-end">
                              <Button type="button" variant="ghost" size="icon" className="text-destructive"
                                onClick={() => { setFaqList(faqList.filter((_, i) => i !== index)); setIsDirty(true); }}>
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full gap-2 border-dashed border-2 py-5 rounded-xl"
                          onClick={() => { setFaqList([...faqList, { question: "", answer: "" }]); setIsDirty(true); }}>
                          <Plus size={16} /> Adicionar pergunta
                        </Button>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 3 — SOBRE NÓS (ordem = ordem visual da página pública)
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "sobre" && (
                  <div className="space-y-6 max-w-3xl">
                    {/* 1. Cabeçalho da página */}
                    <Block title="Cabeçalho da Página" icon={ImageIcon}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Imagem do cabeçalho</Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[130px] bg-background">
                            {form.about_header_image
                              ? <img src={form.about_header_image} alt="Cabeçalho Sobre" className="h-20 object-contain rounded mb-2" />
                              : <p className="text-xs text-muted-foreground mb-2">Usa a logo se vazio</p>
                            }
                            <input ref={aboutHeaderInputRef} type="file" accept="image/*" className="hidden" onChange={handleAboutHeaderUpload} />
                            <Button type="button" variant="outline" size="sm" disabled={uploadingAboutHeader}
                              onClick={() => aboutHeaderInputRef.current?.click()} className="gap-2 text-xs rounded-lg">
                              {uploadingAboutHeader ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              {form.about_header_image ? "Alterar" : "Enviar imagem"}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>Selo / badge</Label>
                            <Input value={form.about_header_badge}
                              onChange={e => setField({ about_header_badge: e.target.value })}
                              placeholder="Nossa História" />
                          </div>
                          <div>
                            <Label>Título — parte normal</Label>
                            <Input value={form.about_header_title_1}
                              onChange={e => setField({ about_header_title_1: e.target.value })}
                              placeholder="Sobre a" />
                          </div>
                          <div>
                            <Label>Título — parte destacada (cor primária)</Label>
                            <Input value={form.about_header_title_2}
                              onChange={e => setField({ about_header_title_2: e.target.value })}
                              placeholder="Festança" />
                          </div>
                        </div>
                      </div>
                    </Block>

                    {/* 2. Texto Quem Somos */}
                    <Block title="Texto Quem Somos" icon={Info}>
                      <Label hint="Cada linha vira um parágrafo. Exibido na Home e na página Sobre Nós.">
                        Texto principal
                      </Label>
                      <Textarea rows={6} value={form.about_text}
                        onChange={e => setField({ about_text: e.target.value })}
                        placeholder="Nascemos do desejo de transformar momentos especiais em memórias inesquecíveis..." />
                    </Block>

                    {/* 3. Missão */}
                    <Block title="Nossa Missão" icon={Info}>
                      <div className="space-y-4">
                        <div>
                          <Label>Título do bloco</Label>
                          <Input value={form.mission_title}
                            onChange={e => setField({ mission_title: e.target.value })}
                            placeholder="Nossa Missão" />
                        </div>
                        <div>
                          <Label>Texto completo</Label>
                          <Textarea rows={4} value={form.about_mission}
                            onChange={e => setField({ about_mission: e.target.value })}
                            placeholder="Democratizar o acesso a decorações de eventos premium através do aluguel..." />
                        </div>
                      </div>
                    </Block>

                    {/* 4. Visão */}
                    <Block title="Nossa Visão" icon={Info}>
                      <div className="space-y-4">
                        <div>
                          <Label>Título do bloco</Label>
                          <Input value={form.vision_title}
                            onChange={e => setField({ vision_title: e.target.value })}
                            placeholder="Nossa Visão" />
                        </div>
                        <div>
                          <Label>Texto completo</Label>
                          <Textarea rows={4} value={form.about_vision}
                            onChange={e => setField({ about_vision: e.target.value })}
                            placeholder="Ser a referência em locação de decoração para eventos no Brasil..." />
                        </div>
                      </div>
                    </Block>

                    {/* 5. Cards "Por Que Escolher" */}
                    <Block title="Por Que Escolher a Festança? (Cards)" icon={Info} defaultOpen={false}>
                      <div className="space-y-4">
                        {form.about_features.map((feat: any, index: number) => (
                          <div key={index} className="flex flex-col md:flex-row gap-4 border border-border p-4 rounded-xl bg-background items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 w-full">
                              <div>
                                <Label>Ícone (nome Lucide)</Label>
                                <Input value={feat.icon}
                                  onChange={e => {
                                    const nf = [...form.about_features]; nf[index].icon = e.target.value;
                                    setField({ about_features: nf });
                                  }}
                                  placeholder="Heart, Award, Users, Sparkles..." />
                              </div>
                              <div>
                                <Label>Título</Label>
                                <Input value={feat.title}
                                  onChange={e => {
                                    const nf = [...form.about_features]; nf[index].title = e.target.value;
                                    setField({ about_features: nf });
                                  }}
                                  placeholder="Feito com Amor" />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Descrição</Label>
                                <Textarea rows={2} value={feat.desc}
                                  onChange={e => {
                                    const nf = [...form.about_features]; nf[index].desc = e.target.value;
                                    setField({ about_features: nf });
                                  }}
                                  placeholder="Cada detalhe é pensado com carinho..." />
                              </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive mt-6"
                              onClick={() => setField({ about_features: form.about_features.filter((_: any, i: number) => i !== index) })}>
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full gap-2 border-dashed border-2 py-5 rounded-xl"
                          onClick={() => setField({ about_features: [...form.about_features, { id: `feat${Date.now()}`, icon: "Star", title: "", desc: "", active: true, order: form.about_features.length + 1 }] })}>
                          <Plus size={16} /> Adicionar card
                        </Button>
                      </div>
                    </Block>

                    {/* 6. Números "Nossos Números" */}
                    <Block title="Nossos Números (Indicadores)" icon={Info} defaultOpen={false}>
                      <div className="space-y-4">
                        {form.about_stats.map((stat: any, index: number) => (
                          <div key={index} className="flex flex-col md:flex-row gap-4 border border-border p-4 rounded-xl bg-background items-start">
                            <div className="grid grid-cols-3 gap-3 flex-1 w-full">
                              <div>
                                <Label>Valor</Label>
                                <Input value={stat.value}
                                  onChange={e => {
                                    const ns = [...form.about_stats]; ns[index].value = e.target.value;
                                    setField({ about_stats: ns });
                                  }}
                                  placeholder="5600" />
                              </div>
                              <div>
                                <Label>Sufixo</Label>
                                <Input value={stat.suffix}
                                  onChange={e => {
                                    const ns = [...form.about_stats]; ns[index].suffix = e.target.value;
                                    setField({ about_stats: ns });
                                  }}
                                  placeholder="+" />
                              </div>
                              <div>
                                <Label>Rótulo</Label>
                                <Input value={stat.label}
                                  onChange={e => {
                                    const ns = [...form.about_stats]; ns[index].label = e.target.value;
                                    setField({ about_stats: ns });
                                  }}
                                  placeholder="Eventos Realizados" />
                              </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive mt-6"
                              onClick={() => setField({ about_stats: form.about_stats.filter((_: any, i: number) => i !== index) })}>
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full gap-2 border-dashed border-2 py-5 rounded-xl"
                          onClick={() => setField({ about_stats: [...form.about_stats, { id: `stat${Date.now()}`, value: "0", suffix: "+", label: "", active: true, order: form.about_stats.length + 1 }] })}>
                          <Plus size={16} /> Adicionar indicador
                        </Button>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 4 — CONTATO E REDES SOCIAIS
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "contato" && (
                  <div className="space-y-6 max-w-3xl">
                    <Block title="Dados de Contato" icon={Phone}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label hint="Usado nos botões WhatsApp do site e rodapé">WhatsApp (com DDD)</Label>
                          <MaskedInput mask="phone" value={form.whatsapp}
                            onAccept={(val: string) => setField({ whatsapp: val })}
                            placeholder="(51) 99120-5664" />
                        </div>
                        <div>
                          <Label hint="Exibido na página de contato e rodapé">Telefone visível</Label>
                          <MaskedInput mask="phone" value={form.phone}
                            onAccept={(val: string) => setField({ phone: val })}
                            placeholder="(51) 99120-5664" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Endereço físico</Label>
                          <Input value={form.address}
                            onChange={e => setField({ address: e.target.value })}
                            placeholder="Av. Frederico Dihl, 3408 – Alvorada/RS" />
                        </div>
                      </div>
                    </Block>

                    <Block title="Redes Sociais" icon={Globe}>
                      <div className="space-y-4">
                        <div>
                          <Label>Instagram (URL completa)</Label>
                          <Input value={form.instagram}
                            onChange={e => setField({ instagram: e.target.value })}
                            placeholder="https://instagram.com/festanca.decoracoes" />
                        </div>
                        <div>
                          <Label>Facebook (URL completa)</Label>
                          <Input value={form.facebook}
                            onChange={e => setField({ facebook: e.target.value })}
                            placeholder="https://facebook.com/share/..." />
                        </div>
                        <div>
                          <Label>TikTok (URL completa)</Label>
                          <Input value={form.tiktok}
                            onChange={e => setField({ tiktok: e.target.value })}
                            placeholder="https://tiktok.com/@festanca.decoracoes" />
                        </div>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 5 — RODAPÉ
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "rodape" && (
                  <div className="space-y-6 max-w-3xl">
                    <Block title="Texto do Rodapé" icon={AlignJustify}>
                      <div>
                        <Label hint="Texto de direitos autorais exibido na parte inferior do site">
                          Direitos autorais / copyright
                        </Label>
                        <Input value={form.footer_text}
                          onChange={e => setField({ footer_text: e.target.value })}
                          placeholder="Festança Decorações. Todos os direitos reservados." />
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        Os links do rodapé (Política de Privacidade, Política de Reembolso, Fale Conosco) são fixos no código do rodapé.
                        Redes sociais e endereço vêm da aba <strong>Contato e Redes</strong>.
                      </p>
                    </Block>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 6 — SEO E TÉCNICO
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "seo" && (
                  <div className="space-y-6 max-w-3xl">
                    <Block title="Identidade do Site" icon={Globe}>
                      <div className="space-y-4">
                        <div>
                          <Label hint="Nome exibido no título do navegador e em compartilhamentos">
                            Nome do site
                          </Label>
                          <Input value={form.site_name}
                            onChange={e => setField({ site_name: e.target.value })}
                            placeholder="Festança Decorações" />
                        </div>
                        <div>
                          <Label hint="Descrição exibida em motores de busca e ao compartilhar em redes sociais. Independente do texto Quem Somos.">
                            Descrição SEO (meta description)
                          </Label>
                          <Textarea rows={3} value={form.description}
                            onChange={e => setField({ description: e.target.value })}
                            placeholder="Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais." />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ideal: entre 120–160 caracteres. Atual: {form.description.length} caracteres.
                          </p>
                        </div>
                      </div>
                    </Block>
                  </div>
                )}

                {/* ── Bottom save button ── */}
                <div className="pt-6 pb-12 max-w-3xl">
                  <SaveButton isSaving={isSaving} size="lg" />
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
