import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Upload, Loader2, Palette, AlertCircle } from "lucide-react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label } from "./SettingsComponents";

export default function SettingsIdentity() {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    logo_url: "",
    favicon_url: "",
    primary_color: "#ff4f9a",
    secondary_color: "#111827",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    if (settings && !isDirty) {
      setForm({
        logo_url: settings.logo_url || "",
        favicon_url: settings.favicon_url || "",
        primary_color: settings.primary_color || "#ff4f9a",
        secondary_color: settings.secondary_color || "#111827",
      });
    }
  }, [settings]);

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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync(form);
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      setIsDirty(false);
      toast.success("Alterações salvas com sucesso!");
    } catch (err) {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout title="Identidade Visual">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">Identidade Visual</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Identidade Visual
            </Button>
          </div>
        </div>

        <Block title="Identidade Visual Principal" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label hint="Formato PNG com fundo transparente. Recomendado: 400x120px.">Logo Principal</Label>
              <div className="mt-2 flex flex-col gap-3">
                {form.logo_url && (
                  <div className="h-20 w-48 bg-accent/20 rounded-xl border border-border flex items-center justify-center p-3 relative group">
                    <img src={form.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {form.logo_url ? "Trocar Logo" : "Fazer Upload"}
                  </Button>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </div>
            </div>

            <div>
              <Label hint="Ícone que aparece na aba do navegador. Quadrado perfeito (ex: 64x64px), ICO ou PNG.">Favicon</Label>
              <div className="mt-2 flex flex-col gap-3">
                {form.favicon_url && (
                  <div className="h-20 w-20 bg-accent/20 rounded-xl border border-border flex items-center justify-center p-3 relative group">
                    <img src={form.favicon_url} alt="Favicon" className="max-h-full max-w-full object-contain rounded-md" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon}>
                    {uploadingFavicon ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {form.favicon_url ? "Trocar Favicon" : "Upload Favicon"}
                  </Button>
                  <input type="file" ref={faviconInputRef} className="hidden" accept="image/*, .ico" onChange={handleFaviconUpload} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <Label hint="Cor principal usada em botões e destaques.">Cor Primária (Hexadecimal)</Label>
              <div className="flex gap-3">
                <Input type="color" value={form.primary_color} onChange={e => setField({ primary_color: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={form.primary_color} onChange={e => setField({ primary_color: e.target.value })} placeholder="#FF0000" className="uppercase" />
              </div>
            </div>
            <div>
              <Label hint="Cor secundária usada em textos escuros e rodapés.">Cor Secundária (Hexadecimal)</Label>
              <div className="flex gap-3">
                <Input type="color" value={form.secondary_color} onChange={e => setField({ secondary_color: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={form.secondary_color} onChange={e => setField({ secondary_color: e.target.value })} placeholder="#000000" className="uppercase" />
              </div>
            </div>
          </div>
        </Block>
      </div>
    </SettingsLayout>
  );
}
