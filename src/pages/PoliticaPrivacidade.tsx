import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PoliticaPrivacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Política de Privacidade" 
        description="Conheça a nossa Política de Privacidade e saiba como tratamos seus dados pessoais com segurança e transparência."
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
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: 12 de Fevereiro de 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <p className="text-lg text-foreground/80 leading-relaxed mb-10">
            A Festança Decorações valoriza a sua privacidade e está comprometida com a proteção dos seus dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). Esta Política explica como coletamos, utilizamos e protegemos suas informações.
          </p>

          <div className="space-y-12">
            {[
              { title: "1. Dados Coletados", text: "Podemos coletar as seguintes informações: nome completo, telefone, e-mail, endereço do evento, data da festa, preferências de decoração, informações de pagamento e dados de navegação (cookies e IP)." },
              { title: "2. Finalidade da Coleta", text: "Os dados são utilizados para: realizar orçamentos e reservas, processar pagamentos, organizar entrega e montagem da decoração, responder via WhatsApp ou e-mail, enviar comunicações promocionais (quando autorizado) e melhorar a experiência no site." },
              { title: "3. Compartilhamento de Dados", text: "Seus dados poderão ser compartilhados apenas quando necessário para prestação do serviço, como com intermediadores de pagamento, serviços de hospedagem e ferramentas de envio de e-mail. Não vendemos ou comercializamos dados pessoais." },
              { title: "4. Armazenamento e Segurança", text: "Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda ou vazamento. As informações são armazenadas em ambiente seguro e com acesso restrito." },
              { title: "5. Cookies", text: "Utilizamos cookies para melhorar a navegação, personalizar conteúdo e analisar o tráfego. O usuário pode desativar cookies nas configurações do navegador." },
              { title: "6. Direitos do Titular", text: "Nos termos da LGPD, você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados, bem como revogar consentimentos concedidos." },
              { title: "7. Contato", text: "Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato pelo e-mail informado na página de contato." },
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

export default PoliticaPrivacidade;

