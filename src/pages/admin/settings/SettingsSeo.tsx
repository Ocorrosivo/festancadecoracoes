import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Globe, AlertCircle } from "lucide-react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label } from "./SettingsComponents";

export default function SettingsSeo() {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState({
    site_name: "",
    description: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !isDirty) {
      setForm({
        site_name: settings.site_name || "",
        description: settings.description || "",
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
    <SettingsLayout title="SEO e Técnico">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">SEO e Técnico</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar SEO
            </Button>
          </div>
        </div>

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
    </SettingsLayout>
  );
}
