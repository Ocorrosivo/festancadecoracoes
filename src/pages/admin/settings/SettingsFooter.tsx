import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Type, AlertCircle } from "lucide-react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label } from "./SettingsComponents";

export default function SettingsFooter() {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState({
    footer_text: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !isDirty) {
      setForm({
        footer_text: settings.footer_text || "",
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
    <SettingsLayout title="Rodapé">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">Rodapé</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Rodapé
            </Button>
          </div>
        </div>

        <Block title="Conteúdo do Rodapé" icon={Type}>
          <div className="space-y-4">
            <div>
              <Label hint="Pequeno texto descritivo que aparece na parte inferior do site.">
                Texto do Rodapé
              </Label>
              <Textarea rows={4} value={form.footer_text}
                onChange={e => setField({ footer_text: e.target.value })}
                className="resize-none"
                placeholder="Transformando momentos em memórias inesquecíveis..." />
            </div>
          </div>
        </Block>
      </div>
    </SettingsLayout>
  );
}
