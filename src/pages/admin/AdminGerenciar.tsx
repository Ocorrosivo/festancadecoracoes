import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Users, Loader2, CheckCircle, XCircle, Pencil, ShieldCheck, Key, Mail } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { useToast } from "@/hooks/use-toast";
import { invokeAdminFunction } from "@/utils/adminApi";
import { getAdminProfile } from "@/utils/adminSession";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface Permissions {
  users?: boolean;
  products?: boolean;
  categories?: boolean;
  banners?: boolean;
  settings?: boolean;
  clients?: boolean;
  storage?: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  status: string;
  role: string;
  permissions: Permissions | null;
  last_access: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Ativo: { label: "Ativo", className: "bg-green-500/15 text-green-700 border-green-300" },
  Inativo: { label: "Inativo", className: "bg-red-500/15 text-red-700 border-red-300" },
};

const defaultPermissions = {
  users: false, products: false, categories: false, banners: false, settings: false, clients: false, storage: false
};

const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  users: "Usuários",
  products: "Produtos",
  categories: "Categorias",
  banners: "Banners",
  settings: "Configurações",
  clients: "Clientes",
  storage: "Storage",
};

const AdminGerenciar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Password change
  const [passwordChangeAdmin, setPasswordChangeAdmin] = useState<AdminUser | null>(null);
  const [newPasswordOnly, setNewPasswordOnly] = useState("");

  // Email change
  const [emailChangeAdmin, setEmailChangeAdmin] = useState<AdminUser | null>(null);
  const [newEmailOnly, setNewEmailOnly] = useState("");

  // Create form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Viewer");
  const [newPermissions, setNewPermissions] = useState<Permissions>({ ...defaultPermissions });
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPermissions, setEditPermissions] = useState<Permissions>({ ...defaultPermissions });

  const currentAdminId = getAdminProfile()?.id;

  const invoke = useCallback(
    (body: Record<string, unknown>) =>
      invokeAdminFunction<{
        error?: string | null;
        admins?: AdminUser[];
      }>("admin-auth", body, { throwOnPayloadError: false }),
    []
  );

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoke({ action: "list" });
      if (data?.error) {
        if (data.error.includes("privilégios")) {
           toast({ title: "Acesso Negado", description: "Somente Master pode acessar esta tela.", variant: "destructive" });
           navigate("/admin/dashboard");
        } else {
           toast({ title: data.error, variant: "destructive" });
        }
      } else if (data?.admins) {
        setAdmins(data.admins);
      }
    } catch {
      toast({ title: "Erro ao carregar administradores", variant: "destructive" });
    }
    setLoading(false);
  }, [invoke, toast, navigate]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

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

    setCreating(true);
    try {
      const data = await invoke({ 
        action: "create", 
        email: trimmedEmail, 
        password: newPassword, 
        name: trimmedName || null,
        role: newRole,
        permissions: newRole === "Master" ? {users:true, products:true, categories:true, banners:true, settings:true, clients:true, storage:true} : newPermissions
      });
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Usuário criado com sucesso!" });
        setCreateOpen(false);
        setNewEmail(""); setNewPassword(""); setNewName(""); setNewRole("Viewer"); setNewPermissions({...defaultPermissions});
        fetchAdmins();
      }
    } catch {
      toast({ title: "Erro ao criar usuário", variant: "destructive" });
    }
    setCreating(false);
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      const data = await invoke({ action: "toggle_status", id: admin.id, status: newStatus });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: `Administrador ${newStatus} com sucesso!` });
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
    setEditRole(admin.role);
    setEditPermissions(admin.permissions || { ...defaultPermissions });
  };

  const handleEdit = async () => {
    if (!editAdmin) return;
    try {
      const data = await invoke({
        action: "update",
        id: editAdmin.id,
        new_name: editName.trim(),
        new_email: editEmail.trim() !== editAdmin.email ? editEmail.trim() : undefined,
        role: editRole,
        permissions: editRole === "Master" ? {users:true, products:true, categories:true, banners:true, settings:true, clients:true, storage:true} : editPermissions
      });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: "Administrador atualizado!" });
      setEditAdmin(null);
      fetchAdmins();
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordChangeAdmin || newPasswordOnly.length < 6) {
        toast({ title: "Senha inválida (min. 6 caracteres)", variant: "destructive" });
        return;
    }
    try {
      const data = await invoke({ action: "change_password", email: passwordChangeAdmin.email, password: newPasswordOnly });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: "Senha alterada com sucesso!" });
      setPasswordChangeAdmin(null);
      setNewPasswordOnly("");
    } catch {
      toast({ title: "Erro ao alterar senha", variant: "destructive" });
    }
  }

  const handleChangeEmail = async () => {
    if (!emailChangeAdmin || !newEmailOnly.trim() || !newEmailOnly.includes("@")) {
      toast({ title: "Email inválido", variant: "destructive" });
      return;
    }
    try {
      const data = await invoke({ action: "change_email", old_email: emailChangeAdmin.email, new_email: newEmailOnly.trim() });
      if (data?.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: "Email alterado com sucesso!" });
      setEmailChangeAdmin(null);
      setNewEmailOnly("");
      fetchAdmins();
    } catch {
      toast({ title: "Erro ao alterar email", variant: "destructive" });
    }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
  
  const handlePermChange = (perm: keyof Permissions, checked: boolean, isEdit: boolean) => {
      if (isEdit) {
          setEditPermissions(prev => ({ ...prev, [perm]: checked }));
      } else {
          setNewPermissions(prev => ({ ...prev, [perm]: checked }));
      }
  };

  const renderPermissionsCheckboxes = (perms: Permissions, isEdit: boolean) => {
      return (
          <div className="grid grid-cols-2 gap-2 mt-2 p-3 border rounded-lg bg-muted/20">
              {(Object.keys(PERMISSION_LABELS) as Array<keyof Permissions>).map(key => (
                  <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`${isEdit?'edit':'new'}-${key}`} 
                        checked={!!perms[key]}
                        onCheckedChange={(c) => handlePermChange(key, c as boolean, isEdit)}
                      />
                      <Label htmlFor={`${isEdit?'edit':'new'}-${key}`} className="text-sm font-normal cursor-pointer">
                          {PERMISSION_LABELS[key]}
                      </Label>
                  </div>
              ))}
          </div>
      )
  }

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
              Gestão de Acessos
            </h1>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="rounded-xl gap-2">
            <UserPlus size={16} />
            Novo Usuário
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="md:hidden mb-4">
            <Button onClick={() => setCreateOpen(true)} className="w-full rounded-xl gap-2">
              <UserPlus size={16} />
              Novo Usuário
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
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => {
                      const sc = statusConfig[admin.status] || { label: admin.status, className: "bg-gray-100 text-gray-700" };
                      const isSelf = admin.id === currentAdminId;
                      return (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium whitespace-nowrap">{admin.name || "Sem nome"}</TableCell>
                          <TableCell className="whitespace-nowrap">{admin.email}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm font-medium">
                              <ShieldCheck size={14} className={admin.role === 'Master' ? "text-primary" : "text-muted-foreground"} />
                              {admin.role}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(admin.created_at)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEmailChangeAdmin(admin); setNewEmailOnly(""); }} title="Alterar Email">
                                <Mail size={15} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setPasswordChangeAdmin(admin)} title="Alterar Senha">
                                <Key size={15} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(admin)} title="Editar">
                                <Pencil size={15} />
                              </Button>
                              {!isSelf && (
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(admin)} title={admin.status === "Ativo" ? "Desativar" : "Ativar"} className={admin.status === "Ativo" ? "text-red-500 hover:text-red-600" : "text-green-600 hover:text-green-700"}>
                                  {admin.status === "Ativo" ? <XCircle size={15} /> : <CheckCircle size={15} />}
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
                  const sc = statusConfig[admin.status] || { label: admin.status, className: "bg-gray-100 text-gray-700" };
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <ShieldCheck size={12} className={admin.role === 'Master' ? "text-primary" : ""} /> {admin.role}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(admin)} className="rounded-lg text-xs gap-1 h-8">
                          <Pencil size={12} /> Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setEmailChangeAdmin(admin); setNewEmailOnly(""); }} className="rounded-lg text-xs gap-1 h-8">
                          <Mail size={12} /> Email
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPasswordChangeAdmin(admin)} className="rounded-lg text-xs gap-1 h-8">
                          <Key size={12} /> Senha
                        </Button>
                        {!isSelf && (
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(admin)} className={`rounded-lg text-xs gap-1 h-8 ${admin.status === "Ativo" ? "text-red-500 border-red-300" : "text-green-600 border-green-300"}`}>
                            {admin.status === "Ativo" ? <><XCircle size={12} /> Desativar</> : <><CheckCircle size={12} /> Ativar</>}
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nome completo</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome" />
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
              <label className="text-sm font-medium text-muted-foreground">Função (Role)</label>
              <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Viewer">Viewer (Apenas Visualização)</SelectItem>
                      <SelectItem value="Editor">Editor (Conteúdo)</SelectItem>
                      <SelectItem value="Admin">Admin (Gestão Geral)</SelectItem>
                      <SelectItem value="Master">Master (Acesso Total)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            {newRole !== "Master" && (
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Permissões Específicas</label>
                    {renderPermissionsCheckboxes(newPermissions, false)}
                </div>
            )}

            <Button onClick={handleCreate} disabled={creating} className="w-full rounded-xl mt-4">
              {creating ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : "Criar Usuário"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
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
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Função (Role)</label>
              <Select value={editRole} onValueChange={setEditRole} disabled={editAdmin?.email === 'festanca.decoracoes@outlook.com'}>
                  <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Viewer">Viewer (Apenas Visualização)</SelectItem>
                      <SelectItem value="Editor">Editor (Conteúdo)</SelectItem>
                      <SelectItem value="Admin">Admin (Gestão Geral)</SelectItem>
                      <SelectItem value="Master">Master (Acesso Total)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            {editRole !== "Master" && (
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Permissões Específicas</label>
                    {renderPermissionsCheckboxes(editPermissions, true)}
                </div>
            )}

            <Button onClick={handleEdit} className="w-full rounded-xl mt-4">Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={!!passwordChangeAdmin} onOpenChange={() => setPasswordChangeAdmin(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <p className="text-sm text-muted-foreground">Definir nova senha para <strong>{passwordChangeAdmin?.email}</strong></p>
             <Input type="password" value={newPasswordOnly} onChange={e => setNewPasswordOnly(e.target.value)} placeholder="Nova senha (min. 6 char)" />
             <Button onClick={handleChangePassword} className="w-full rounded-xl">Atualizar Senha</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={!!emailChangeAdmin} onOpenChange={() => setEmailChangeAdmin(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <p className="text-sm text-muted-foreground">Email atual: <strong>{emailChangeAdmin?.email}</strong></p>
             <Input type="email" value={newEmailOnly} onChange={e => setNewEmailOnly(e.target.value)} placeholder="Novo email" />
             <Button onClick={handleChangeEmail} className="w-full rounded-xl">Atualizar Email</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Usuário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja remover este usuário permanentemente? Essa ação não pode ser desfeita.
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
