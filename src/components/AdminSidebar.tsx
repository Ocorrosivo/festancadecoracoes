import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Megaphone, ShieldCheck, Image as ImageIcon, Tags, Settings, Palette, Home, Info, Phone, AlignJustify, Globe, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { NavLink as RouterNavLink, useNavigate, useLocation } from "react-router-dom";
import logoFestanca from "@/assets/logo-festanca.png";
import { getAdminProfile, adminLogout } from "@/utils/adminSession";
import { useSiteSettings } from "@/hooks/useSiteSettings";

// A custom NavLink to replace the one from @/components/NavLink if we need special handling, but we can just use router's NavLink.
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

  return allLinks.filter(link => {
    if (role === "Master") return true;
    if (link.role && link.role !== role) return false;
    if (link.key && !permissions[link.key]) return false;
    return true;
  });
};

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
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
    <aside className="w-72 bg-card border-r border-border min-h-screen hidden md:flex flex-col fixed top-0 left-0 z-40 overflow-y-auto">
      <div className="px-6 py-6 shrink-0">
        <img src={logo} alt={siteName} className="h-[42px] w-auto object-contain mb-2" />
        <p className="text-[11px] text-muted-foreground leading-tight">
          Hora: {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Data: {currentTime.toLocaleDateString("pt-BR")}
        </p>
      </div>

      <nav className="flex flex-col gap-1 px-4 flex-1 pb-4">
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
  );
};

export default AdminSidebar;
