import { useState, useEffect, useRef } from "react";
import { Save, Upload, Loader2, Image as ImageIcon, LayoutTemplate, Smartphone, Tablet, Monitor } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { useHeroBanner, useUpdateHeroBanner } from "@/hooks/useHeroBanner";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AdminBanner = () => {
  const { data: banner, isLoading } = useHeroBanner();
  const updateBanner = useUpdateHeroBanner();

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: "",
    desktop_image_url: "",
    tablet_image_url: "",
    mobile_image_url: "",
    badge_text: "",
    title: "",
    subtitle: "",
    description: "",
    button_text: "",
    button_link: "",
    secondary_button_text: "",
    secondary_button_link: "",
    is_active: true,
  });

  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingTablet, setUploadingTablet] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  useEffect(() => {
    if (banner) {
      setForm({
        id: banner.id || "",
        desktop_image_url: banner.desktop_image_url || "",
        tablet_image_url: banner.tablet_image_url || "",
        mobile_image_url: banner.mobile_image_url || "",
        badge_text: banner.badge_text || "",
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        button_text: banner.button_text || "",
        button_link: banner.button_link || "",
        secondary_button_text: banner.secondary_button_text || "",
        secondary_button_link: banner.secondary_button_link || "",
        is_active: banner.is_active ?? true,
      });
    }
  }, [banner]);

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDesktop(true);
    try {
      const url = await uploadStorageFile(file, "banners");
      setForm((prev) => ({ ...prev, desktop_image_url: url }));
      toast.success("Imagem Desktop enviada!");
    } catch {
      toast.error("Erro ao enviar imagem desktop.");
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleTabletUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTablet(true);
    try {
      const url = await uploadStorageFile(file, "banners");
      setForm((prev) => ({ ...prev, tablet_image_url: url }));
      toast.success("Imagem Tablet enviada!");
    } catch {
      toast.error("Erro ao enviar imagem tablet.");
    } finally {
      setUploadingTablet(false);
    }
  };

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMobile(true);
    try {
      const url = await uploadStorageFile(file, "banners");
      setForm((prev) => ({ ...prev, mobile_image_url: url }));
      toast.success("Imagem Mobile enviada!");
    } catch {
      toast.error("Erro ao enviar imagem mobile.");
    } finally {
      setUploadingMobile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBanner.mutate(form, {
      onSuccess: () => {
        toast.success("Banner da Home salvo no Supabase!");
      },
      onError: () => {
        toast.error("Erro ao salvar banner.");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />

        <header className="hidden md:flex bg-card border-b border-border px-6 py-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Páginas / <span className="text-foreground">Banner da Home</span>
            </p>
            <h1 className="text-xl font-heading font-bold text-foreground">
              Gerenciar Banner Principal
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={updateBanner.isPending} className="rounded-xl gap-2 shadow-md">
            {updateBanner.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar Banner
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Imagens do Banner (Desktop, Tablet, Mobile) */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ImageIcon size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Imagens por Dispositivo</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Desktop */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                      <Monitor size={14} /> Desktop (1920x1080)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px] bg-background">
                      {form.desktop_image_url ? (
                        <img src={form.desktop_image_url} alt="Desktop Banner" className="max-h-24 object-cover rounded-lg w-full" />
                      ) : (
                        <p className="text-xs text-muted-foreground text-center">Imagem Padrão</p>
                      )}
                      <input ref={desktopInputRef} type="file" accept="image/*" className="hidden" onChange={handleDesktopUpload} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDesktop}
                        onClick={() => desktopInputRef.current?.click()}
                        className="mt-3 gap-2 text-xs rounded-lg w-full"
                      >
                        {uploadingDesktop ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Upload Desktop
                      </Button>
                    </div>
                  </div>

                  {/* Tablet */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                      <Tablet size={14} /> Tablet (1024x768)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px] bg-background">
                      {form.tablet_image_url ? (
                        <img src={form.tablet_image_url} alt="Tablet Banner" className="max-h-24 object-cover rounded-lg w-full" />
                      ) : (
                        <p className="text-xs text-muted-foreground text-center">Mesmo do Desktop</p>
                      )}
                      <input ref={tabletInputRef} type="file" accept="image/*" className="hidden" onChange={handleTabletUpload} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingTablet}
                        onClick={() => tabletInputRef.current?.click()}
                        className="mt-3 gap-2 text-xs rounded-lg w-full"
                      >
                        {uploadingTablet ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Upload Tablet
                      </Button>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                      <Smartphone size={14} /> Mobile (768x1024)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px] bg-background">
                      {form.mobile_image_url ? (
                        <img src={form.mobile_image_url} alt="Mobile Banner" className="max-h-24 object-cover rounded-lg w-full" />
                      ) : (
                        <p className="text-xs text-muted-foreground text-center">Mesmo do Desktop</p>
                      )}
                      <input ref={mobileInputRef} type="file" accept="image/*" className="hidden" onChange={handleMobileUpload} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingMobile}
                        onClick={() => mobileInputRef.current?.click()}
                        className="mt-3 gap-2 text-xs rounded-lg w-full"
                      >
                        {uploadingMobile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Upload Mobile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Textos e Botões */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <LayoutTemplate size={20} className="text-primary" />
                  <h2 className="font-bold text-lg">Textos & Botões</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Selo do Topo (Badge)</label>
                    <Input
                      value={form.badge_text}
                      onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                      placeholder="✨ Você sonha, nós realizamos"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Título Principal</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Festança Decorações"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Subtítulo</label>
                    <Input
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="Momentos Mágicos, Memórias Inesquecíveis"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Texto Descritivo</label>
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Descrição em destaque no banner..."
                    />
                  </div>

                  {/* Primary & Secondary Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
                    {/* Botão Principal */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-foreground">Botão Principal</h3>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Texto</label>
                        <Input
                          value={form.button_text}
                          onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                          placeholder="Ver Catálogo"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Link / Rota</label>
                        <Input
                          value={form.button_link}
                          onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                          placeholder="/produtos"
                        />
                      </div>
                    </div>

                    {/* Botão Secundário */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-foreground">Botão Secundário</h3>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Texto</label>
                        <Input
                          value={form.secondary_button_text}
                          onChange={(e) => setForm({ ...form, secondary_button_text: e.target.value })}
                          placeholder="WhatsApp"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Link (Deixe vazio para usar WhatsApp padrão)</label>
                        <Input
                          value={form.secondary_button_link}
                          onChange={(e) => setForm({ ...form, secondary_button_link: e.target.value })}
                          placeholder="Link customizado ou vazio"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={updateBanner.isPending} className="w-full sm:w-auto px-8 rounded-xl gap-2 py-6 text-base font-bold shadow-lg">
                  {updateBanner.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Salvar Banner
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminBanner;
