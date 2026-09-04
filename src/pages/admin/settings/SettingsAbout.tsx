import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Loader2, Info, ImageIcon, Target, Star, Check, Plus, AlertCircle } from "lucide-react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label, CompactCard, IconPicker } from "./SettingsComponents";

export default function SettingsAbout() {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();



  const [form, setForm] = useState({
    about_text: "",

    about_header_badge: "",
    about_header_title_1: "",
    about_header_title_2: "",
    mission_title: "",
    about_mission: "",
    vision_title: "",
    about_vision: "",
    about_features: [] as any[],
    about_stats: [] as any[],
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

  useEffect(() => {
    if (settings && !isDirty) {
      setForm({
        about_text: settings.about_text || "",

        about_header_badge: settings.about_header_badge || "",
        about_header_title_1: settings.about_header_title_1 || "",
        about_header_title_2: settings.about_header_title_2 || "",
        mission_title: settings.mission_title || "",
        about_mission: settings.about_mission || "",
        vision_title: settings.vision_title || "",
        about_vision: settings.about_vision || "",
        about_features: settings.about_features || [],
        about_stats: settings.about_stats || [],
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



  const moveItem = <T,>(array: T[], index: number, direction: 1 | -1, setter: (val: T[]) => void) => {
    if (index + direction < 0 || index + direction >= array.length) return;
    const newArr = [...array];
    const temp = newArr[index];
    newArr[index] = newArr[index + direction];
    newArr[index + direction] = temp;
    
    const fixedArr = newArr.map((item: any, i) => {
      if ('order' in item) return { ...item, order: i + 1 };
      if ('display_order' in item) return { ...item, display_order: i + 1 };
      return item;
    });
    
    setter(fixedArr);
    setIsDirty(true);
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
    <SettingsLayout title="Sobre Nós">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">Sobre Nós</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Sobre Nós
            </Button>
          </div>
        </div>

        <Block title="Cabeçalho e História" icon={ImageIcon}>
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
    </SettingsLayout>
  );
}
