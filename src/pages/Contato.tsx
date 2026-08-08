import { useState } from "react";
import { Send, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { COMPANY, buildWhatsAppUrl } from "@/config/constants";
import SEO from "@/components/SEO";


const Contato = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (trimmedName.length > 100 || trimmedPhone.length > 20 || trimmedMessage.length > 1000) {
      toast({ title: "Verifique o tamanho dos campos", variant: "destructive" });
      return;
    }

    toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
    setForm({ name: "", phone: "", message: "" });
  };

    const info = [
    { icon: Phone, label: "Telefone", value: COMPANY.phone },
    { icon: Mail, label: "E-mail", value: COMPANY.email },
    { icon: MapPin, label: "Endereço", value: COMPANY.address, link: COMPANY.maps },
  ];

  return (
    <div className="min-h-screen bg-background font-display">
      <SEO 
        title="Fale Conosco" 
        description="Entre em contato com a Festança Decorações para orçamentos, dúvidas ou para agendar sua decoração personalizada."
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Fale Conosco</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Tem dúvidas ou quer um orçamento personalizado? Entre em contato!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-primary/10 p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                placeholder="Como podemos ajudar?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Enviar Mensagem <Send size={18} />
            </button>
          </form>

          {/* Contact info */}
          <div className="space-y-8">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-4 bg-card rounded-2xl border border-primary/10 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <i.icon className="text-primary" size={22} />
                </div>
                <div>
                  <p className="font-bold">{i.label}</p>
                  {"link" in i && i.link ? (
                    <a href={i.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {i.value}
                    </a>
                  ) : (
                    <p className="text-muted-foreground text-sm break-all">{i.value}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href={buildWhatsAppUrl("Olá! Gostaria de saber mais sobre os serviços da Festança.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold transition-all"
            >
              <MessageCircle size={20} />
              Falar pelo WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
