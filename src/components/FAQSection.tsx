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

import { useFaqs } from "@/hooks/useFaqs";

const FAQSection = () => {
  const { data: faqs = [] } = useFaqs();
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


      </div>
    </section>
  );
};

export default FAQSection;
