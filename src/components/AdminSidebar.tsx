import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Users, BarChart3, LogOut, KeyRound, Megaphone, ShieldCheck, Mail, Image as ImageIcon, Tags, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import logoFestanca from "@/assets/logo-festanca.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const mainLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: Tags },
  { to: "/admin/banner", label: "Banner Home", icon: ImageIcon },
  { to: "/admin/configuracoes", label: "Configurações Site", icon: Settings },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { to: "/admin/gerenciar", label: "Gerenciar Admins", icon: ShieldCheck },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentEmail = localStorage.getItem("festiva_admin_email") || "";
  const adminToken = localStorage.getItem("festiva_admin_token") || "";

  const handleLogout = () => {
    localStorage.removeItem("festiva_admin");
    localStorage.removeItem("festiva_admin_token");
    localStorage.removeItem("festiva_admin_id");
    localStorage.removeItem("festiva_admin_email");
    localStorage.removeItem("festiva_admin_name");
    navigate("/admin");
  };

  const handleChangePassword = async () => {
    if (newPass.length < 3) {
      toast({ title: "Nova senha muito curta", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: {
          action: "change_password",
          email: currentEmail,
          password: newPass,
          admin_token: adminToken,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Senha alterada com sucesso!" });
        setPasswordOpen(false);
        setNewPass("");
        setConfirmPass("");
      }
    } catch {
      toast({ title: "Erro ao alterar senha", variant: "destructive" });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({ title: "Email inválido", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: {
          action: "change_email",
          old_email: currentEmail,
          new_email: newEmail,
          admin_token: adminToken,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        localStorage.setItem("festiva_admin_email", newEmail.trim().toLowerCase());
        toast({ title: "Email alterado com sucesso!" });
        setEmailOpen(false);
        setNewEmail("");
      }
    } catch {
      toast({ title: "Erro ao alterar email", variant: "destructive" });
    }
  };

  return (
    <>
      <aside className="w-72 bg-card border-r border-border min-h-screen hidden md:flex flex-col fixed top-0 left-0 z-40">
        <div className="px-6 py-6">
          <img src={logoFestanca} alt="Festança" className="h-[42px] w-auto object-contain mb-2" />
          <p className="text-[11px] text-muted-foreground leading-tight">
            Hora: {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Data: {currentTime.toLocaleDateString("pt-BR")}
          </p>
        </div>

        <nav className="flex flex-col gap-1 px-4 flex-1">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary font-bold"
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 mb-1">
          <button
            onClick={() => setEmailOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <Mail size={18} />
            Alterar Email
          </button>
        </div>

        <div className="px-4 mb-2">
          <button
            onClick={() => setPasswordOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <KeyRound size={18} />
            Alterar Senha
          </button>
        </div>

        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nova Senha</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-all"
            >
              Salvar Nova Senha
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email Atual</label>
              <p className="text-sm text-foreground px-4 py-3 rounded-xl border border-border bg-muted/30">{currentEmail}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Novo Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <button
              onClick={handleChangeEmail}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-all"
            >
              Salvar Novo Email
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSidebar;
