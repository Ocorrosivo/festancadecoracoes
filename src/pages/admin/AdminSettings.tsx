import { useState, useEffect, useRef } from "react";
import { Save, Upload, Loader2, Globe, Palette, Phone, HelpCircle, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { useFaqs, useUpdateFaqs, type FaqItem } from "@/hooks/useFaqs";
import { useGallery, useUpdateGallery, type GallerySettings } from "@/hooks/useGallery";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MaskedInput } from "@/components/ui/MaskedInput";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { data: faqsData, isLoading: isLoadingFaqs } = useFaqs();
  const updateFaqs = useUpdateFaqs();
  const { data: galleryData, isLoading: isLoadingGallery } = useGallery();
  const updateGallery = useUpdateGallery();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    logo_url: "",
    favicon_url: "",
    site_name: "",
    description: "",
    primary_color: "#ff4f9a",
    secondary_color: "#111827",
    whatsapp: "",
    phone: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    address: "",
    footer_text: "",
  });
  
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [galleryForm, setGalleryForm] = useState<GallerySettings>({ title: "", quote: "", images: [] });
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        logo_url: settings.logo_url || "",
        favicon_url: settings.favicon_url || "",
        site_name: settings.site_name || "",
        description: settings.description || "",
        primary_color: settings.primary_color || "#ff4f9a",
        secondary_color: settings.secondary_color || "#111827",
        whatsapp: settings.whatsapp || "",
        phone: settings.phone || "",
        instagram: settings.instagram || "",
        facebook: settings.facebook || "",
        tiktok: settings.tiktok || "",
        address: settings.address || "",
        footer_text: settings.footer_text || "",
      });
    }
    if (faqsData) {
      setFaqList(faqsData);
    }
    if (galleryData) {
      setGalleryForm(galleryData);
    }
  }, [settings, faqsData, galleryData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadStorageFile(file, "logos");
      setForm((prev) => ({ ...prev, logo_url: url }));
      toast.success("Logo enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadStorageFile(file, "favicon");
      setForm((prev) => ({ ...prev, favicon_url: url }));
      toast.success("Favicon enviado com sucesso!");
    } catch {
      toast.error("Erro ao enviar favicon.");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(form, {
      onSuccess: () => {
        toast.success("Configurações salvas no Supabase!");
      },
      onError: (error) => {
        // Toast amigável para o usuário, causa real no console: a mensagem
        // genérica escondia erros de schema (ex.: coluna inexistente) e o
        // diagnóstico exigia ler os logs da Edge Function.
        const err = error as { message?: string; status?: number; context?: { status?: number } };
        console.error("[site_settings.upsert] falha ao salvar", {
          resource: "site_settings",
          action: "upsert",
          status: err?.status ?? err?.context?.status,
          message: err?.message,
          campos: Object.keys(form),
        });
        toast.error(err?.message || "Erro ao salvar configurações.");
      },
    });
    
    // Salva FAQs
    updateFaqs.mutate(faqList);
    // Salva Galeria
    updateGallery.mutate(galleryForm);
  };
  
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryIdx(index);
    try {
      const url = await uploadStorageFile(file, "banners");
      const newImages = [...galleryForm.images];
      if (newImages[index]) {
        newImages[index].src = url;
      } else {
        newImages[index] = { src: url, alt: "Imagem da galeria" };
      }
      setGalleryForm({ ...galleryForm, images: newImages });
      toast.success("Imagem enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar imagem da galeria.");
    } finally {
      setUploadingGalleryIdx(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />

        <header className="hidden md:flex bg-card border-b border-border px-6 py-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Páginas / <span className="text-foreground">Configurações do Site</span>
            </p>
            <h1 className="text-xl font-heading font-bold text-foreground">
              Configurações Gerais
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={updateSettings.isPending} className="rounded-xl gap-2 shadow-md">
            {updateSettings.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar Alterações
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-4xl">
          {isLoading || isLoadingFaqs ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identidade Visual */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Palette size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Identidade Visual & Cores</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo do Site</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-background">
                      {form.logo_url ? (
                        <div className="relative group w-full flex items-center justify-center">
                          <img src={form.logo_url} alt="Logo" className="max-h-20 object-contain" />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhuma logo enviada</p>
                      )}
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="mt-3 gap-2 text-xs rounded-lg"
                      >
                        {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {form.logo_url ? "Alterar Logo" : "Enviar Logo"}
                      </Button>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Favicon do Site</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-background">
                      {form.favicon_url ? (
                        <img src={form.favicon_url} alt="Favicon" className="w-10 h-10 object-contain rounded-lg" />
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhum favicon enviado</p>
                      )}
                      <input ref={faviconInputRef} type="file" accept="image/*,.ico" className="hidden" onChange={handleFaviconUpload} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFavicon}
                        onClick={() => faviconInputRef.current?.click()}
                        className="mt-3 gap-2 text-xs rounded-lg"
                      >
                        {uploadingFavicon ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {form.favicon_url ? "Alterar Favicon" : "Enviar Favicon"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Cor Primária</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={form.primary_color}
                        onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <Input
                        value={form.primary_color}
                        onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                        placeholder="#ff4f9a"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Cor Secundária</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={form.secondary_color}
                        onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <Input
                        value={form.secondary_color}
                        onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                        placeholder="#111827"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Gerais */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Globe size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Informações do Site & SEO</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Nome do Site</label>
                    <Input
                      value={form.site_name}
                      onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                      placeholder="Ex: Festança Decorações"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Descrição Principal (SEO Global)</label>
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Descrição detalhada sobre a empresa..."
                    />
                  </div>
                </div>
              </div>

              {/* Contatos & Redes Sociais */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Phone size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Contatos & Redes Sociais</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">WhatsApp (Número com DDD)</label>
                    <MaskedInput
                      mask="phone"
                      value={form.whatsapp}
                      onAccept={(val: string) => setForm({ ...form, whatsapp: val })}
                      placeholder="(41) 98402-7094"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Telefone Visível</label>
                    <MaskedInput
                      mask="phone"
                      value={form.phone}
                      onAccept={(val: string) => setForm({ ...form, phone: val })}
                      placeholder="(41) 3333-4444 ou (41) 98402-7094"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Link do Instagram</label>
                    <Input
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      placeholder="https://instagram.com/festanca"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Link do Facebook</label>
                    <Input
                      value={form.facebook}
                      onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                      placeholder="https://facebook.com/festanca"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Link do TikTok</label>
                    <Input
                      value={form.tiktok}
                      onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@festanca"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-muted-foreground">Endereço Físico</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Endereço da empresa"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Texto do Rodapé</label>
                  <Input
                    value={form.footer_text}
                    onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                    placeholder="Festança Decorações. Todos os direitos reservados."
                  />
                </div>
              </div>

              {/* Perguntas Frequentes (FAQs) */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <HelpCircle size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Perguntas Frequentes (FAQ)</h2>
                </div>
                
                <div className="space-y-4">
                  {faqList.map((faq, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 border border-border p-4 rounded-xl bg-background">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Pergunta</label>
                          <Input 
                            value={faq.question}
                            onChange={(e) => {
                              const newList = [...faqList];
                              newList[index].question = e.target.value;
                              setFaqList(newList);
                            }}
                            placeholder="Ex: Como funciona o aluguel?"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Resposta</label>
                          <Textarea 
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const newList = [...faqList];
                              newList[index].answer = e.target.value;
                              setFaqList(newList);
                            }}
                            placeholder="Resposta para a pergunta acima..."
                          />
                        </div>
                      </div>
                      <div className="flex sm:flex-col justify-end items-end pb-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setFaqList(faqList.filter((_, i) => i !== index))}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full gap-2 border-dashed border-2 py-6 rounded-xl"
                    onClick={() => setFaqList([...faqList, { question: "", answer: "" }])}
                  >
                    <Plus size={16} /> Adicionar Pergunta
                  </Button>
                </div>
              </div>

              {/* Galeria da Home */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ImageIcon size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Seção: Arte em Detalhes</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Título Principal</label>
                    <Input
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      placeholder="Use asteriscos para destacar. Ex: Nossa *Arte em Detalhes*"
                    />
                    <p className="text-xs text-muted-foreground">Use *asteriscos* para a parte rosa e em itálico.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Citação / Subtítulo</label>
                    <Textarea
                      rows={2}
                      value={galleryForm.quote}
                      onChange={(e) => setGalleryForm({ ...galleryForm, quote: e.target.value })}
                      placeholder="Transformamos espaços em experiências inesquecíveis..."
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <label className="text-sm font-medium text-muted-foreground block">Imagens da Galeria</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map((idx) => {
                        const img = galleryForm.images[idx];
                        const isUploading = uploadingGalleryIdx === idx;
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="aspect-square border-2 border-dashed border-border rounded-xl p-2 flex flex-col items-center justify-center bg-background relative overflow-hidden group">
                              {img?.src ? (
                                <img src={img.src} alt={img.alt} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <p className="text-xs text-muted-foreground text-center px-2">Nenhuma imagem</p>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer text-white bg-black/50 p-2 rounded-full hover:bg-black/70">
                                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleGalleryImageUpload(e, idx)}
                                    disabled={isUploading}
                                  />
                                </label>
                              </div>
                            </div>
                            <Input 
                              placeholder="Texto Alternativo (Alt)" 
                              className="text-xs h-8"
                              value={img?.alt || ""}
                              onChange={(e) => {
                                const newImages = [...galleryForm.images];
                                if (!newImages[idx]) newImages[idx] = { src: "", alt: "" };
                                newImages[idx].alt = e.target.value;
                                setGalleryForm({ ...galleryForm, images: newImages });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-12">
                <Button type="submit" disabled={updateSettings.isPending || updateFaqs.isPending || updateGallery.isPending} className="w-full sm:w-auto px-8 rounded-xl gap-2 py-6 text-base font-bold shadow-lg">
                  {updateSettings.isPending || updateFaqs.isPending || updateGallery.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Salvar Configurações
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
