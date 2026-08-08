import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Loader2, 
  ChevronDown,
  UserCheck,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminClientDialog from "@/components/AdminClientDialog";
import { exportToExcel, exportToCSV } from "@/utils/exportUtils";
import { Badge } from "@/components/ui/badge";

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

const AdminClientes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("festiva_admin") !== "true") {
      navigate("/admin");
      return;
    }
    fetchClientes();
  }, [navigate]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const admin_token = localStorage.getItem("festiva_admin_token");
      const { data, error } = await supabase.functions.invoke("admin-data", {
        body: { resource: "clients", action: "list", admin_token },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setClientes(data?.data || []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao buscar clientes",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;

    try {
      const admin_token = localStorage.getItem("festiva_admin_token");
      const { data, error } = await supabase.functions.invoke("admin-data", {
        body: { resource: "clients", action: "delete", admin_token, id: deletingClient.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Cliente excluído com sucesso" });
      setClientes(clientes.filter(c => c.id !== deletingClient.id));
      setIsAlertOpen(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir cliente",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (c.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
    );
  }, [clientes, searchTerm]);

  const stats = useMemo(() => {
    const total = clientes.length;
    const ativos = clientes.filter(c => c.status === "Ativo").length;
    const novosMes = clientes.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total, ativos, novosMes };
  }, [clientes]);

  const handleExport = (format: "csv" | "excel") => {
    const dataToExport = filteredClientes.map(c => ({
      Nome: c.nome,
      Email: c.email || "-",
      Telefone: c.telefone || "-",
      Empresa: c.empresa || "-",
      Cidade: c.cidade || "-",
      Status: c.status,
      "Total Locações": c.total_locacoes,
      "Última Locação": c.ultima_locacao ? new Date(c.ultima_locacao).toLocaleDateString("pt-BR") : "-",
      "Data Cadastro": new Date(c.created_at).toLocaleDateString("pt-BR"),
    }));

    if (format === "csv") {
      exportToCSV(dataToExport, "clientes_export");
    } else {
      exportToExcel(dataToExport, "clientes_export");
    }
    toast({ title: "Exportação concluída" });
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Páginas / <span className="text-foreground">Clientes</span></p>
              <h1 className="text-xl font-heading font-bold text-foreground">Gestão de Clientes</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-1.5 border border-border">
                <Search size={16} className="text-muted-foreground" />
                <input 
                  placeholder="Buscar cliente..." 
                  className="bg-transparent text-sm focus:outline-none w-32 lg:w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download size={16} />
                    <span className="hidden sm:inline">Exportar</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>Exportar CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>Exportar Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" className="gap-2" onClick={() => { setEditingClient(null); setIsDialogOpen(true); }}>
                <Plus size={16} />
                <span className="hidden sm:inline">Novo Cliente</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users size={18} className="text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Total de Clientes</span>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 hover:border-green-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <UserCheck size={18} className="text-green-500" />
                </div>
                <span className="text-xs text-muted-foreground">Clientes Ativos</span>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.ativos}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <UserPlus size={18} className="text-amber-500" />
                </div>
                <span className="text-xs text-muted-foreground">Novos este Mês</span>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.novosMes}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Carregando clientes...</p>
                </div>
              ) : filteredClientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                    <Users size={32} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Nenhum cliente cadastrado</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Comece adicionando seu primeiro cliente para gerenciar suas locações.
                    </p>
                  </div>
                  <Button onClick={() => { setEditingClient(null); setIsDialogOpen(true); }}>
                    <Plus size={16} className="mr-2" /> Cadastrar Primeiro Cliente
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-accent/30 text-muted-foreground">
                      <th className="text-left py-3 px-4">Cliente</th>
                      <th className="text-left py-3 px-4 hidden sm:table-cell">Contato</th>
                      <th className="text-left py-3 px-4 hidden md:table-cell">Empresa</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Locações</th>
                      <th className="text-right py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.map((c) => (
                      <tr 
                        key={c.id} 
                        className="border-b border-border/50 hover:bg-accent/20 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {c.nome.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{c.nome}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <div className="flex flex-col gap-0.5">
                            {c.email && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={12} /> {c.email}</span>}
                            {c.telefone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={12} /> {c.telefone}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                          {c.empresa || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={c.status === "Ativo" ? "default" : "secondary"}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-bold">{c.total_locacoes}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClient(c);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingClient(c);
                                setIsAlertOpen(true);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <AdminClientDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        client={editingClient}
        onSuccess={fetchClientes}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir este cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente os dados de {deletingClient?.nome} de nosso banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClientes;