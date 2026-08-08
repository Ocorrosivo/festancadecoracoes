import { useState, useEffect } from "react";
import { UserPlus, Trash2, Users, Loader2, CheckCircle, XCircle, Pencil, ShieldCheck } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  status: string;
  role: string;
  last_access: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-green-500/15 text-green-700 border-green-300" },
  pendente: { label: "Pendente", className: "bg-yellow-500/15 text-yellow-700 border-yellow-300" },
  desativado: { label: "Desativado", className: "bg-red-500/15 text-red-700 border-red-300" },
};

const AdminGerenciar = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const adminToken = localStorage.getItem("festiva_admin_token");
  const currentAdminId = localStorage.getItem("festiva_admin_id");

  const invoke = async (body: Record<string, unknown>) => {
    const token = localStorage.getItem("festiva_admin_token");
    if (!token) return { error: "Não autorizado" };
    const { data, error } = await supabase.functions.invoke("admin-auth", {
      body: { ...body, admin_token: token },
    });
    if (error) throw error;
    return data;
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await invoke({ action: "list" });
      if (data?.admins) setAdmins(data.admins);
    } catch {
      toast({ title: "Erro ao carregar administradores", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async () => {
    const trimmedEmail = newEmail.trim();
    const trimmedName = newName.trim();

    if (!trimmedEmail || !newPassword) {
      toast({ title: "Email e senha são obrigatórios", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const data = await invoke({ action: "create", email: trimmedEmail, password: newPassword, name: trimmedName || null });
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Administrador criado com sucesso! Status: Pendente" });
        setCreateOpen(false);
        setNewEmail(""); setNewPassword(""); setConfirmPassword(""); setNewName("");
        fetchAdmins();
      }
    } catch {
      toast({ title: "Erro ao criar administrador", variant: "destructive" });
    }
    setCreating(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const data = await invoke({ action: "approve", id });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: "Administrador aprovado como Master!" });
      fetchAdmins();
    } catch {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === "ativo" ? "desativado" : "ativo";
    try {
      const data = await invoke({ action: "toggle_status", id: admin.id, status: newStatus });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: `Administrador ${newStatus === "ativo" ? "ativado" : "desativado"}!` });
      fetchAdmins();
    } catch {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const data = await invoke({ action: "delete", id });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: "Administrador removido!" });
      fetchAdmins();
    } catch {
      toast({ title: "Erro ao remover administrador", variant: "destructive" });
    }
    setDeleteId(null);
  };

  const openEdit = (admin: AdminUser) => {
    setEditAdmin(admin);
    setEditName(admin.name || "");
    setEditEmail(admin.email);
  };

  const handleEdit = async () => {
    if (!editAdmin) return;
    try {
      const data = await invoke({
        action: "update",
        id: editAdmin.id,
        new_name: editName.trim(),
        new_email: editEmail.trim(),
      });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: "Administrador atualizado!" });
      setEditAdmin(null);
      fetchAdmins();
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString("pt-BR") : "Nunca";

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />

        <header className="hidden md:flex bg-card border-b border-border px-6 py-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Páginas / <span className="text-foreground">Gerenciar Admins</span>
            </p>
            <h1 className="text-xl font-heading font-bold text-foreground">
              Gestão de Administradores
            </h1>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="rounded-xl gap-2">
            <UserPlus size={16} />
            Novo Admin
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="md:hidden mb-4">
            <Button onClick={() => setCreateOpen(true)} className="w-full rounded-xl gap-2">
              <UserPlus size={16} />
              Novo Admin
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p>Nenhum administrador encontrado</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Último acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => {
                      const sc = statusConfig[admin.status] || statusConfig.pendente;
                      const isSelf = admin.id === currentAdminId;
                      return (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.name || "Sem nome"}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-sm">
                              <ShieldCheck size={14} className="text-primary" />
                              Master
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(admin.created_at)}</TableCell>
                          <TableCell>{formatDateTime(admin.last_access)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(admin)} title="Editar">
                                <Pencil size={15} />
                              </Button>
                              {admin.status === "pendente" && (
                                <Button variant="ghost" size="icon" onClick={() => handleApprove(admin.id)} title="Aprovar" className="text-green-600 hover:text-green-700">
                                  <CheckCircle size={15} />
                                </Button>
                              )}
                              {!isSelf && admin.status !== "pendente" && (
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(admin)} title={admin.status === "ativo" ? "Desativar" : "Ativar"} className={admin.status === "ativo" ? "text-red-500 hover:text-red-600" : "text-green-600 hover:text-green-700"}>
                                  {admin.status === "ativo" ? <XCircle size={15} /> : <CheckCircle size={15} />}
                                </Button>
                              )}
                              {!isSelf && (
                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(admin.id)} title="Excluir" className="text-destructive hover:text-destructive">
                                  <Trash2 size={15} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden grid gap-4">
                {admins.map((admin) => {
                  const sc = statusConfig[admin.status] || statusConfig.pendente;
                  const isSelf = admin.id === currentAdminId;
                  return (
                    <div key={admin.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {(admin.name || admin.email).substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{admin.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                        </div>
                        <Badge variant="outline" className={`ml-auto shrink-0 ${sc.className}`}>{sc.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck size={12} className="text-primary" /> Master
                        <span className="mx-1">·</span>
                        Criado: {formatDate(admin.created_at)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => openEdit(admin)} className="rounded-lg text-xs gap-1 h-8">
                          <Pencil size={12} /> Editar
                        </Button>
                        {admin.status === "pendente" && (
                          <Button variant="outline" size="sm" onClick={() => handleApprove(admin.id)} className="rounded-lg text-xs gap-1 h-8 text-green-600 border-green-300">
                            <CheckCircle size={12} /> Aprovar
                          </Button>
                        )}
                        {!isSelf && admin.status !== "pendente" && (
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(admin)} className={`rounded-lg text-xs gap-1 h-8 ${admin.status === "ativo" ? "text-red-500 border-red-300" : "text-green-600 border-green-300"}`}>
                            {admin.status === "ativo" ? <><XCircle size={12} /> Desativar</> : <><CheckCircle size={12} /> Ativar</>}
                          </Button>
                        )}
                        {!isSelf && (
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(admin.id)} className="rounded-lg text-xs gap-1 h-8 text-destructive border-destructive/30">
                            <Trash2 size={12} /> Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Administrador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nome completo</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do administrador" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email *</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Senha *</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Confirmar senha *</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" />
            </div>
            <p className="text-xs text-muted-foreground">
              O novo administrador será criado com status <Badge variant="outline" className={statusConfig.pendente.className}>Pendente</Badge> até ser aprovado.
            </p>
            <Button onClick={handleCreate} disabled={creating} className="w-full rounded-xl">
              {creating ? <><Loader2 size={16} className="animate-spin" /> Criando...</> : "Criar Administrador"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
            </div>
            <Button onClick={handleEdit} className="w-full rounded-xl">Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Administrador</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja remover este administrador? Essa ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 rounded-xl">
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGerenciar;
