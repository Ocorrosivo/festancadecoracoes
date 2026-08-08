import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBookings } from "@/data/bookings";

const mockClientes = [
  { id: 1, nome: "Maria Silva", email: "maria@email.com", telefone: "(11) 99999-1234", cidade: "São Paulo", totalLocacoes: 5, ultimaLocacao: "2025-12-10" },
  { id: 2, nome: "João Oliveira", email: "joao@email.com", telefone: "(21) 98888-5678", cidade: "Rio de Janeiro", totalLocacoes: 3, ultimaLocacao: "2025-11-22" },
  { id: 3, nome: "Ana Costa", email: "ana@email.com", telefone: "(31) 97777-9012", cidade: "Belo Horizonte", totalLocacoes: 8, ultimaLocacao: "2026-01-05" },
  { id: 4, nome: "Carlos Santos", email: "carlos@email.com", telefone: "(41) 96666-3456", cidade: "Curitiba", totalLocacoes: 2, ultimaLocacao: "2025-10-18" },
  { id: 5, nome: "Fernanda Lima", email: "fernanda@email.com", telefone: "(51) 95555-7890", cidade: "Porto Alegre", totalLocacoes: 6, ultimaLocacao: "2026-02-01" },
];

// Mock booking history per client
const mockBookingHistory = [
  { clientId: 1, product: "Arco Floral Royal", date: "2025-12-10", price: "R$ 299,00", status: "Concluído" },
  { clientId: 1, product: "Conjunto Sonho Pastel", date: "2025-10-05", price: "R$ 149,00", status: "Concluído" },
  { clientId: 1, product: "Gala Ouro & Branco", date: "2025-08-20", price: "R$ 210,00", status: "Concluído" },
  { clientId: 1, product: "Setup Piquenique Boho", date: "2025-06-15", price: "R$ 185,00", status: "Concluído" },
  { clientId: 1, product: "Jardim Encantado", date: "2025-04-02", price: "R$ 345,00", status: "Concluído" },
  { clientId: 2, product: "Baby Boy Voyage", date: "2025-11-22", price: "R$ 159,00", status: "Concluído" },
  { clientId: 2, product: "Arco Floral Royal", date: "2025-09-10", price: "R$ 299,00", status: "Concluído" },
  { clientId: 2, product: "Conjunto Sonho Pastel", date: "2025-07-01", price: "R$ 149,00", status: "Concluído" },
  { clientId: 3, product: "Jardim Encantado", date: "2026-01-05", price: "R$ 345,00", status: "Agendado" },
  { clientId: 3, product: "Gala Ouro & Branco", date: "2025-12-20", price: "R$ 210,00", status: "Concluído" },
  { clientId: 3, product: "Arco Floral Royal", date: "2025-11-15", price: "R$ 299,00", status: "Concluído" },
  { clientId: 4, product: "Setup Piquenique Boho", date: "2025-10-18", price: "R$ 185,00", status: "Concluído" },
  { clientId: 4, product: "Baby Boy Voyage", date: "2025-08-05", price: "R$ 159,00", status: "Concluído" },
  { clientId: 5, product: "Arco Floral Royal", date: "2026-02-01", price: "R$ 299,00", status: "Agendado" },
  { clientId: 5, product: "Jardim Encantado", date: "2025-12-28", price: "R$ 345,00", status: "Concluído" },
  { clientId: 5, product: "Gala Ouro & Branco", date: "2025-11-10", price: "R$ 210,00", status: "Concluído" },
  { clientId: 5, product: "Conjunto Sonho Pastel", date: "2025-09-22", price: "R$ 149,00", status: "Concluído" },
  { clientId: 5, product: "Setup Piquenique Boho", date: "2025-07-14", price: "R$ 185,00", status: "Concluído" },
  { clientId: 5, product: "Baby Boy Voyage", date: "2025-05-30", price: "R$ 159,00", status: "Concluído" },
];

const AdminClienteDetalhe = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (localStorage.getItem("festiva_admin") !== "true") navigate("/admin");
  }, [navigate]);

  const cliente = mockClientes.find((c) => c.id === Number(id));
  const historico = mockBookingHistory.filter((b) => b.clientId === Number(id));

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
