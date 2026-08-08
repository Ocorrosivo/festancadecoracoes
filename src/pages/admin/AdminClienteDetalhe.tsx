import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  status: string;
  cidade: string | null;
  total_locacoes: number;
  ultima_locacao: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  product: string;
  date: string;
  price: number;
  status: string;
}

const AdminClienteDetalhe = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<Client | null>(null);
  const [historico, setHistorico] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("festiva_admin") !== "true") {
      navigate("/admin");
      return;
    }
    if (id) {
      fetchClientDetails();
    }
  }, [id, navigate]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const admin_token = localStorage.getItem("festiva_admin_token");
      const { data, error } = await supabase.functions.invoke("admin-data", {
        body: { resource: "clients", action: "get", admin_token, id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setCliente(data?.data);
      setHistorico(data?.bookings || []);
    } catch (err: any) {
      toast({ title: "Erro ao buscar detalhes", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-body flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 md:ml-72">
          <AdminMobileHeader />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-background font-body flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 md:ml-72">
          <AdminMobileHeader />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Cliente não encontrado.</p>
              <Button variant="outline" onClick={() => navigate("/admin/clientes")}>
                <ArrowLeft size={16} className="mr-2" /> Voltar
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const initials = cliente.nome.split(" ").map((n) => n[0]).join("");

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Back */}
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/admin/clientes")}>
            <ArrowLeft size={16} className="mr-2" /> Voltar para Clientes
          </Button>

          {/* Client Info Card */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-heading font-bold text-foreground">{cliente.nome}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {cliente.email}</span>
                  <span className="flex items-center gap-1.5"><Phone size={14} /> {cliente.telefone}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {cliente.cidade}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-foreground">{cliente.totalLocacoes}</p>
                <p className="text-xs text-muted-foreground">Total de Locações</p>
              </div>
              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-foreground">
                  {new Date(cliente.ultimaLocacao).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">Última Locação</p>
              </div>
              <div className="bg-accent/30 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-2xl font-heading font-bold text-foreground">
                  {historico.filter((h) => h.status === "Agendado").length}
                </p>
                <p className="text-xs text-muted-foreground">Agendamentos Ativos</p>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Histórico de Agendamentos
              </h2>
            </div>
            {historico.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum agendamento encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-accent/30 text-muted-foreground">
                      <th className="text-left py-3 px-4">Produto</th>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-left py-3 px-4">Valor</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            <Package size={14} className="text-primary" />
                            {h.product}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(h.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{h.price}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              h.status === "Agendado"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminClienteDetalhe;
