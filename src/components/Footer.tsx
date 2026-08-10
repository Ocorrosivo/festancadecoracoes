import { MapPin, Mail, Phone } from "lucide-react";
import logoFestancaDefault from "@/assets/logo-festanca.webp";
import { Link } from "react-router-dom";
import { COMPANY, buildWhatsAppUrl } from "@/config/constants";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Footer = () => {
  const { data: siteSettings } = useSiteSettings();

  const logo = siteSettings?.logo_url || logoFestancaDefault;
  const siteName = siteSettings?.site_name || COMPANY.name;
  const phone = siteSettings?.phone || COMPANY.phone;
  const whatsapp = siteSettings?.whatsapp || "5511999999999";
  const address = siteSettings?.address || COMPANY.address;
  const footerText = siteSettings?.footer_text || `© ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.`;
  const facebookUrl = siteSettings?.facebook || COMPANY.facebook;
  const instagramUrl = siteSettings?.instagram || COMPANY.instagram;

  const socialLinks = [
    { icon: FacebookIcon, href: facebookUrl },
    { icon: InstagramIcon, href: instagramUrl },
  ];

  return (
    <footer className="bg-footer-bg pt-12 md:pt-20 pb-8 md:pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="space-y-6 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2.5">
              <img src={logo} alt={siteName} className="h-[36px] md:h-[45px] w-auto object-contain" />
            </Link>
            <p className="text-xs md:text-sm text-footer-link leading-relaxed max-w-sm mx-auto md:mx-0">
              {siteSettings?.description || COMPANY.tagline}
            </p>
            <div className="flex justify-center md:justify-start gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary-hover transition-all duration-300 shadow-md"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-heading font-bold mb-4 md:mb-6 text-footer-text">Links Rápidos</h4>
            <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-footer-link">
              <li><Link className="hover:text-gold transition-colors duration-300 block" to="/">Início</Link></li>
              <li><Link className="hover:text-gold transition-colors duration-300 block" to="/produtos">Produtos</Link></li>
              <li><Link className="hover:text-gold transition-colors duration-300 block" to="/sobre">Sobre Nós</Link></li>
              <li><Link className="hover:text-gold transition-colors duration-300 block" to="/contato">Contato</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-heading font-bold mb-4 md:mb-6 text-footer-text">Contato</h4>
            <div className="space-y-3 md:space-y-4 text-xs md:text-sm text-footer-link">
              <a
                href={buildWhatsAppUrl(`Olá! Gostaria de saber mais sobre as decorações da ${siteName}.`, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2 hover:text-primary transition-colors duration-300"
              >
                <Phone size={16} className="shrink-0 text-primary" />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center justify-center md:justify-start gap-2 hover:text-primary transition-colors duration-300"
              >
                <Mail size={16} className="shrink-0 text-primary" />
                <span className="break-all">{COMPANY.email}</span>
              </a>
              <div className="flex items-start justify-center md:justify-start gap-2 text-footer-link">
                <MapPin size={16} className="shrink-0 mt-0.5 text-primary" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-footer-text/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-footer-link">
          <p>
            {footerText}{" "}
            <span className="hidden sm:inline">·</span>{" "}
            Desenvolvido por{" "}
            <a
              href="https://brainstors.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors duration-300 font-medium"
            >
              Agencia Brainstors
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link className="hover:text-gold transition-colors duration-300" to="/politica-de-privacidade">Política de Privacidade</Link>
            <Link className="hover:text-gold transition-colors duration-300" to="/politica-de-reembolso">Política de Reembolso</Link>
            <a
              className="hover:text-gold transition-colors duration-300"
              href={buildWhatsAppUrl(`Olá! Gostaria de saber mais sobre os serviços da ${siteName}.`, whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
