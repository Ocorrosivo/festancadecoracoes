import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Package, Users, BarChart3, LogOut, Bell, Megaphone, ShieldCheck, Image as ImageIcon, Tags, Settings, Palette, Home, Info, Phone, AlignJustify, Globe, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { NavLink as RouterNavLink, useNavigate, useLocation } from "react-router-dom";
import logoFestanca from "@/assets/logo-festanca.png";
import { getAdminProfile, adminLogout } from "@/utils/adminSession";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const getFilteredLinks = () => {
  const profile = getAdminProfile();
  const role = profile?.role || "Viewer";
  const permissions: Record<string, boolean> = profile?.permissions || {};

  const allLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/produtos", label: "Produtos", icon: Package, key: "products" },
    { to: "/admin/categorias", label: "Categorias", icon: Tags, key: "categories" },
    { to: "/admin/banner", label: "Banner Home", icon: ImageIcon, key: "banners" },
    {
      to: "/admin/configuracoes",
      label: "Configurações Site",
      icon: Settings,
      key: "settings",
      subItems: [
        { to: "/admin/configuracoes/identidade", label: "Identidade Visual", icon: Palette },
        { to: "/admin/configuracoes/home", label: "Conteúdo da Home", icon: Home },
        { to: "/admin/configuracoes/sobre", label: "Sobre Nós", icon: Info },
        { to: "/admin/configuracoes/contato", label: "Contato e Redes", icon: Phone },
        { to: "/admin/configuracoes/seo", label: "SEO e Técnico", icon: Globe },
        { to: "/admin/configuracoes/faq", label: "Perguntas Frequentes", icon: HelpCircle },
      ]
    },
    { to: "/admin/clientes", label: "Clientes", icon: Users, key: "clients" },
    { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
    { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
    { to: "/admin/gerenciar", label: "Gestão de Acessos", icon: ShieldCheck, role: "Master" },
  ];

  return allLinks.filter((link) => {
    if (role === "Master") return true;
    if (link.role && link.role !== role) return false;
    if (link.key && !permissions[link.key]) return false;
    return true;
  });
};

const AdminMobileHeader = () => {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { data: siteSettings } = useSiteSettings();
  const logo = siteSettings?.logo_url || logoFestanca;
  const siteName = siteSettings?.site_name || "Festança";

  const isSettingsActive = location.pathname.startsWith("/admin/configuracoes");
  const [settingsExpanded, setSettingsExpanded] = useState(isSettingsActive);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (isSettingsActive) {
      setSettingsExpanded(true);
    }
  }, [isSettingsActive]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin");
  };

  const links = getFilteredLinks();

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-2 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <Menu size={20} className="text-foreground" />
          </button>
          <div className="flex flex-col">
            <img src={logo} alt={siteName} className="h-[28px] md:h-[34px] w-auto object-contain" />
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
            <div className="px-5 py-4 flex items-center justify-between border-b border-border shrink-0">
              <img src={logo} alt={siteName} className="h-9 w-auto object-contain" />
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-accent transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto pb-6">
              {links.map((link) => {
                if (link.subItems) {
                  const isActive = isSettingsActive;
                  return (
                    <div key={link.to} className="flex flex-col">
                      <button
                        type="button"
                        aria-expanded={settingsExpanded}
                        onClick={() => setSettingsExpanded(!settingsExpanded)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon size={18} />
                          {link.label}
                        </div>
                        {settingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {settingsExpanded && (
                        <div className="mt-1 flex flex-col gap-1 pl-4 border-l-2 border-border/50 ml-6">
                          {link.subItems.map((sub) => (
                            <RouterNavLink
                              key={sub.to}
                              to={sub.to}
                              onClick={() => setOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                                  isActive
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "text-muted-foreground font-medium hover:bg-accent hover:text-foreground"
                                }`
                              }
                            >
                              <sub.icon size={16} />
                              {sub.label}
                            </RouterNavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <RouterNavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    end={link.to === "/admin/dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground font-medium hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    <link.icon size={18} />
                    {link.label}
                  </RouterNavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-4 pb-6 shrink-0 mt-auto">
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
