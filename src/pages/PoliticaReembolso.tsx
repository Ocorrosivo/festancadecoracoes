import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PoliticaReembolso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Política de Reembolso" 
        description="Confira nossas diretrizes para cancelamentos, reagendamentos e reembolsos de locação de decorações."
      />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="group mb-6 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Home
          </Button>
          
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Política de Reembolso e Cancelamento
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: 12 de Fevereiro de 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <p className="text-lg text-foreground/80 leading-relaxed mb-10">
            A presente Política estabelece as regras para cancelamento, reagendamento e reembolso dos serviços de locação de decoração oferecidos pela Festança Decorações.
          </p>

          <div className="space-y-12">
            {[
              { title: "1. Reserva e Pagamento", text: "A reserva da decoração é confirmada mediante pagamento do sinal ou valor integral acordado. A data somente é garantida após a confirmação do pagamento." },
              { title: "2. Cancelamento pelo Cliente", text: "Cancelamentos solicitados com até 7 dias após a contratação seguem o direito de arrependimento previsto no Código de Defesa do Consumidor, quando aplicável às contratações online. Após esse prazo, aplicam-se as condições abaixo." },
              { title: "3. Reembolso", text: "Cancelamentos realizados com mais de 30 dias de antecedência do evento poderão ter restituição parcial, descontando custos operacionais e administrativos. Cancelamentos com menos de 30 dias podem não gerar reembolso, considerando a preparação prévia do serviço." },
              { title: "4. Reagendamento", text: "O reagendamento poderá ser solicitado conforme disponibilidade de agenda. Não há garantia de manutenção de valores promocionais anteriores." },
              { title: "5. Cancelamento por Força Maior", text: "Em casos de força maior (eventos climáticos graves, restrições legais ou situações imprevisíveis), será priorizado o reagendamento. Caso não seja possível, as partes poderão negociar reembolso proporcional." },
              { title: "6. Problemas na Prestação do Serviço", text: "Caso haja falha comprovada na prestação do serviço, o cliente deverá comunicar imediatamente para que possamos solucionar da melhor forma possível." },
              { title: "7. Contato", text: "Para solicitações de cancelamento ou reembolso, entre em contato pelos canais oficiais informados no site." },
            ].map((section, i) => (
              <div key={i} className="group">
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  {section.title.split('. ')[1] || section.title}
                </h2>
                <p className="text-foreground/80 leading-relaxed pl-11">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaReembolso;

