import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FaqItem {
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "Como funciona o aluguel de decoração?",
    answer:
      "Você escolhe o kit de decoração no nosso catálogo, reserva a data desejada e nós cuidamos de toda a montagem e desmontagem no local do evento. Simples e prático!",
  },
  {
    question: "Vocês entregam e montam no local?",
    answer:
      "Sim! Nossa equipe faz a entrega, montagem completa e retirada após o evento. Você não precisa se preocupar com nada.",
  },
  {
    question: "Com quanto tempo de antecedência devo reservar?",
    answer:
      "Recomendamos reservar com pelo menos 7 dias de antecedência para garantir a disponibilidade do kit desejado. Em datas comemorativas, sugerimos reservar com ainda mais antecedência.",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer:
      "Aceitamos cartões de crédito e débito, Pix e dinheiro. Consulte condições de parcelamento pelo WhatsApp.",
  },
  {
    question: "Posso personalizar a decoração?",
    answer:
      "Sim! Oferecemos opções de personalização como cores, temas e elementos adicionais. Entre em contato pelo WhatsApp para conversarmos sobre o seu evento.",
  },
  {
    question: "Qual a área de atendimento?",
    answer:
      "Atendemos Alvorada e toda a região metropolitana de Porto Alegre. Para outras localidades, consulte a disponibilidade pelo WhatsApp.",
  },
];

export const useFaqs = () => {
  return useQuery({
    queryKey: ["site_faqs"],
    queryFn: async (): Promise<FaqItem[]> => {
      try {
        const { data } = supabase.storage.from("festanca-storage").getPublicUrl("configuracoes/faqs.json");
        const res = await fetch(`${data.publicUrl}?t=${Date.now()}`);
        if (!res.ok) {
          return DEFAULT_FAQS;
        }
        const json = await res.json();
        return Array.isArray(json) ? json : DEFAULT_FAQS;
      } catch (err) {
        return DEFAULT_FAQS;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateFaqs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (faqs: FaqItem[]) => {
      const file = new File([JSON.stringify(faqs)], "faqs.json", { type: "application/json" });
      await uploadStorageFile(file, "configuracoes");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_faqs"] });
      toast.success("Perguntas frequentes atualizadas!");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar FAQs: " + (err.message || "Erro desconhecido"));
    }
  });
};
