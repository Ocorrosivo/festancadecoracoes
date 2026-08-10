import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Megaphone, ShieldCheck, Image as ImageIcon, Tags, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import logoFestanca from "@/assets/logo-festanca.png";
import { getAdminProfile, adminLogout } from "@/utils/adminSession";

const getFilteredLinks = () => {
  const profile = getAdminProfile();
  const role = profile?.role || "Viewer";
  const permissions: Record<string, boolean> = profile?.permissions || {};

  const allLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/produtos", label: "Produtos", icon: Package, key: "products" },
    { to: "/admin/categorias", label: "Categorias", icon: Tags, key: "categories" },
    { to: "/admin/banner", label: "Banner Home", icon: ImageIcon, key: "banners" },
    { to: "/admin/configuracoes", label: "Configurações Site", icon: Settings, key: "settings" },
    { to: "/admin/clientes", label: "Clientes", icon: Users, key: "clients" },
    { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
    { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
    { to: "/admin/gerenciar", label: "Gestão de Acessos", icon: ShieldCheck, role: "Master" },
  ];

  return allLinks.filter(link => {
    if (role === "Master") return true;
    if (link.role && link.role !== role) return false;
    if (link.key && !permissions[link.key]) return false;
    return true;
  });
};

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin");
  };

  return (
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
        {getFilteredLinks().map((link) => (
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
  );
};

export default AdminSidebar;
