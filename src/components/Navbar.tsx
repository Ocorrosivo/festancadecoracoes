import { Menu } from "lucide-react";
import logoFestancaDefault from "@/assets/logo-festanca.webp";
import { NavLink } from "@/components/NavLink";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Produtos", to: "/produtos" },
  { label: "Sobre Nós", to: "/sobre" },
  { label: "Contato", to: "/contato" },
];

const Navbar = () => {
  const { data: siteSettings } = useSiteSettings();
  const logo = siteSettings?.logo_url || logoFestancaDefault;
  const siteName = siteSettings?.site_name || "Festança Decorações";

  return (
    <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt={siteName} className="h-10 md:h-[55px] w-auto object-contain transition-all" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
                activeClassName="text-primary font-bold"
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <img src={logo} alt={siteName} className="h-[45px] w-auto object-contain" />
                </div>
                <nav className="flex flex-col p-6 gap-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === "/"}
                        className="text-base font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                        activeClassName="bg-accent text-primary font-bold"
                      >
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
