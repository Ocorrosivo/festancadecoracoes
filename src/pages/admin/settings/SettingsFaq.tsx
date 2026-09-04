import { useState, useEffect } from "react";
import { Save, Loader2, Info, Plus, AlertCircle } from "lucide-react";
import { useFaqs, useUpdateFaqs, type FaqItem } from "@/hooks/useFaqs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import { Block, Label, CompactCard } from "./SettingsComponents";

export default function SettingsFaq() {
  const queryClient = useQueryClient();
  const { data: faqsData } = useFaqs(false);
  const updateFaqs = useUpdateFaqs();

  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (faqsData && !isDirty) {
      setFaqList(faqsData);
    }
  }, [faqsData]);

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
      await updateFaqs.mutateAsync(faqList);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setIsDirty(false);
      toast.success("Alterações salvas com sucesso!");
    } catch (err) {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout title="Perguntas Frequentes">
      <div className="max-w-4xl space-y-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-bold">Perguntas Frequentes</h2>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <AlertCircle size={12} /> Não salvas
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl shadow-md">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Perguntas Frequentes
            </Button>
          </div>
        </div>

        <Block title="Perguntas Frequentes (FAQ)" icon={Info}>
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
    </SettingsLayout>
  );
}
