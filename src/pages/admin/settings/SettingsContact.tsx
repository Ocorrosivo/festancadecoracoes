import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Phone, Globe, AlertCircle } from "lucide-react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label } from "./SettingsComponents";

export default function SettingsContact() {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState({
    whatsapp: "",
    phone: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    address: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !isDirty) {
      setForm({
        whatsapp: settings.whatsapp || "",
        phone: settings.phone || "",
        instagram: settings.instagram || "",
        facebook: settings.facebook || "",
        tiktok: settings.tiktok || "",
        address: settings.address || "",
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
    <SettingsLayout title="Contato e Redes">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">Contato e Redes</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Contato e Redes
            </Button>
          </div>
        </div>

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
    </SettingsLayout>
  );
}
