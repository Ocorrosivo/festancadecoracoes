import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { buildWhatsAppUrl } from "@/config/constants";
import heroBannerDefault from "@/assets/hero-banner-new.webp";
import { motion } from "framer-motion";
import { useHeroBanner } from "@/hooks/useHeroBanner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const HeroSection = () => {
  const { data: banner } = useHeroBanner();
  const { data: siteSettings } = useSiteSettings();

  const desktopImage = banner?.desktop_image_url || heroBannerDefault;
  const tabletImage = banner?.tablet_image_url || desktopImage;
  const mobileImage = banner?.mobile_image_url || tabletImage;

  const badge = banner?.badge_text || "✨ Você sonha, nós realizamos";
  const title = banner?.title || "Festança Decorações";
  const subtitle = banner?.subtitle || "Momentos Mágicos, Memórias Inesquecíveis";
  const description = banner?.description || "Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.";
  const buttonText = banner?.button_text || "Ver Catálogo";
  const buttonLink = banner?.button_link || "/produtos";
  const secondaryButtonText = banner?.secondary_button_text || "WhatsApp";
  const secondaryButtonLink = banner?.secondary_button_link;

  const whatsappNumber = siteSettings?.whatsapp || "5511999999999";
  const whatsappUrl = secondaryButtonLink || buildWhatsAppUrl(`Olá! Gostaria de saber mais sobre as decorações da ${title}.`, whatsappNumber);

  return (
    <header className="relative min-h-[500px] md:min-h-[680px] overflow-hidden flex items-center">
      {/* Desktop Image */}
      <div className="absolute inset-0 hidden lg:block">
        <motion.img
          alt={title}
          className="w-full h-full object-cover"
          src={desktopImage}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          fetchPriority="high"
          loading="eager"
        />
      </div>

      {/* Tablet Image */}
      <div className="absolute inset-0 hidden sm:block lg:hidden">
        <motion.img
          alt={title}
          className="w-full h-full object-cover"
          src={tabletImage}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          fetchPriority="high"
          loading="eager"
        />
      </div>

      {/* Mobile Image */}
      <div className="absolute inset-0 sm:hidden">
        <motion.img
          alt={title}
          className="w-full h-full object-cover"
          src={mobileImage}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          fetchPriority="high"
          loading="eager"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-transparent md:from-white/75 md:via-white/45 md:to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center py-20 md:py-32 z-20">
        <div className="max-w-3xl text-center">
          {badge && (
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block py-1.5 px-4 md:py-2 md:px-5 bg-primary/15 text-primary rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6 border border-primary/20 backdrop-blur-sm"
            >
              {badge}
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold text-primary leading-[1.1] mb-6 md:mb-8 drop-shadow-md tracking-tight"
          >
            {title} <br />
            {subtitle && (
              <span className="text-2xl sm:text-4xl md:text-5xl italic font-serif text-foreground/85 font-normal block mt-2">
                {subtitle}
              </span>
            )}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm md:text-lg text-foreground/80 mb-6 max-w-xl mx-auto leading-relaxed font-body"
            >
              {description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-10 w-full"
          >
            {buttonText && (
              <Link
                to={buttonLink}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-5 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl w-full sm:w-auto"
                style={{ boxShadow: "0 10px 25px rgba(255,79,154,0.3)" }}
              >
                {buttonText} <ArrowRight size={18} />
              </Link>
            )}

            {secondaryButtonText && (
              <a
                href={whatsappUrl}
                target={whatsappUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="bg-white/90 text-foreground border-2 border-primary/20 px-5 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all hover:bg-white hover:border-primary/40 flex items-center justify-center gap-2 backdrop-blur-sm shadow-lg w-full sm:w-auto"
              >
                <MessageCircle size={18} className="text-primary" />
                {secondaryButtonText}
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
