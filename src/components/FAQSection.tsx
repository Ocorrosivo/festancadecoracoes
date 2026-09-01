import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFaqs } from "@/hooks/useFaqs";

const FAQSection = () => {
  const { data: faqs = [] } = useFaqs();

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
