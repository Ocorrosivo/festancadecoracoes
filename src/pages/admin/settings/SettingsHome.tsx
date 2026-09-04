import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Home, FileText, Image as ImageIcon, Upload, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { useGallerySettings, useUpdateGallerySettings, useGalleryImages, type GalleryImage, type GallerySettings } from "@/hooks/useGallery";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { invokeAdminData } from "@/utils/adminApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label } from "./SettingsComponents";

export default function SettingsHome() {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const { data: gallerySettingsData } = useGallerySettings();
  const updateGallerySettings = useUpdateGallerySettings();

  const { data: galleryImagesData } = useGalleryImages(false);

  const updateGalleryImages = useMutation({
    mutationFn: async (images: any[]) => {
      await invokeAdminData({ action: "upsert_all", payload: images, resource: "art_details_images" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] }),
  });

  const [form, setForm] = useState({});

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [galleryForm, setGalleryForm] = useState<GallerySettings>({ title: "", quote: "" });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null);

  useEffect(() => {
    if (settings && !isDirty) {
      setForm({});
    }
  }, [settings]);

  useEffect(() => { if (gallerySettingsData && !isDirty) setGalleryForm(gallerySettingsData); }, [gallerySettingsData]);
  useEffect(() => { if (galleryImagesData && !isDirty) setGalleryImages(galleryImagesData); }, [galleryImagesData]);

  const setField = useCallback((patch: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [];
      promises.push(updateSettings.mutateAsync(form));
      promises.push(updateGallerySettings.mutateAsync(galleryForm));
      promises.push(updateGalleryImages.mutateAsync(galleryImages));

      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      queryClient.invalidateQueries({ queryKey: ["site_gallery_settings"] });
      queryClient.invalidateQueries({ queryKey: ["site_gallery_images"] });
      setIsDirty(false);
      toast.success("Alterações salvas com sucesso!");
    } catch (err) {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout title="Conteúdo da Home">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">Conteúdo da Home</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Conteúdo da Home
            </Button>
          </div>
        </div>



        <Block title="Seção Galeria - Nossa Arte em Detalhes" icon={ImageIcon}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label hint="Use *asteriscos* para destacar em rosa e itálico.">Título Principal</Label>
                <Input value={galleryForm.title}
                  onChange={e => { setGalleryForm({ ...galleryForm, title: e.target.value }); setIsDirty(true); }}
                  placeholder="Nossa *Arte em Detalhes*" />
              </div>
              <div>
                <Label hint="Frase de apoio ou citação logo abaixo do título.">Subtítulo</Label>
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
                        {img?.image_url ? (
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                            <ImageIcon size={24} className="mb-2 opacity-50" />
                            <span className="text-xs font-medium">Vazio</span>
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder={`Alt ${idx + 1}`}
                        value={img?.image_alt || ""}
                        className="h-8 text-xs bg-background"
                        onChange={e => {
                          const imgs = [...galleryImages];
                          if (imgs[idx]) imgs[idx].image_alt = e.target.value;
                          else imgs[idx] = { image_url: "", image_alt: e.target.value, title: "", display_order: idx, is_active: true };
                          setGalleryImages(imgs);
                          setIsDirty(true);
                        }}
                      />
                      <div className="relative overflow-hidden rounded-md">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          onChange={(e) => handleGalleryImageUpload(e, idx)}
                          disabled={busy}
                        />
                        <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs font-medium gap-1" disabled={busy}>
                          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          Upload
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Block>
      </div>
    </SettingsLayout>
  );
}
