import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Package, Users, BarChart3, LogOut, Bell, Megaphone, ShieldCheck, Image as ImageIcon, Tags, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import logoFestanca from "@/assets/logo-festanca.png";

const links = [
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

const AdminMobileHeader = () => {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("festiva_admin");
    localStorage.removeItem("festiva_admin_token");
    localStorage.removeItem("festiva_admin_id");
    localStorage.removeItem("festiva_admin_email");
    localStorage.removeItem("festiva_admin_name");
    navigate("/admin");
  };

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-2 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <Menu size={20} className="text-foreground" />
          </button>
          <div className="flex flex-col">
            <img src={logoFestanca} alt="Festança" className="h-[28px] md:h-[34px] w-auto object-contain" />
            <p className="text-[8px] text-muted-foreground leading-tight mt-0.5">
              {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} | {currentTime.toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-accent transition-colors">
            <Bell size={18} className="text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            IR
          </div>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-card h-full flex flex-col shadow-xl animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <img src={logoFestanca} alt="Festança" className="h-9 w-auto object-contain" />
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-accent transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1 px-4 py-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  activeClassName="bg-primary/10 text-primary font-bold"
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
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
        </div>
      )}
    </div>
  );
};

export default AdminMobileHeader;
