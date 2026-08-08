import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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

const FAQSection = () => {
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlSuccess, setNlSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    const trimmed = nlEmail.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast({ title: "Digite um email válido", variant: "destructive" });
      return;
    }
    setNlLoading(true);
    try {
      const { error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: trimmed },
      });
      if (error) throw error;
      setNlSuccess(true);
      setNlEmail("");
      toast({ title: "Inscrição realizada com sucesso!" });
    } catch {
      toast({ title: "Erro ao se inscrever. Tente novamente.", variant: "destructive" });
    }
    setNlLoading(false);
  };

  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
            Perguntas Frequentes
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-body">
            Tire suas dúvidas sobre nossos serviços de decoração
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl border border-border px-4 md:px-5">
              <AccordionTrigger className="text-xs md:text-sm font-bold text-foreground hover:no-underline py-4 text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground font-body pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Newsletter */}
        <div className="mt-12 md:mt-16 text-center bg-primary/5 p-6 md:p-10 rounded-3xl border border-primary/10">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Inspire-se</h3>
          <p className="text-xs md:text-sm text-muted-foreground font-body mb-6">
            Assine nossa newsletter para inspirações de eventos e ofertas exclusivas.
          </p>
          {nlSuccess ? (
            <div className="flex items-center justify-center gap-2 text-primary font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CheckCircle size={20} />
              <span>Inscrito com sucesso!</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm w-full text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary focus:outline-none transition-all"
                placeholder="Seu melhor email"
                type="email"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <button
                onClick={handleSubscribe}
                disabled={nlLoading}
                className="bg-primary text-primary-foreground h-11 px-6 rounded-xl hover:bg-primary-hover transition-all duration-300 disabled:opacity-70 font-bold text-sm flex items-center justify-center gap-2"
              >
                {nlLoading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Inscrever</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
