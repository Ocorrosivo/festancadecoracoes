import * as LucideIcons from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoFestanca from "@/assets/logo-festanca.webp";
import SEO from "@/components/SEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicIcon = ({ name, size = 28, className = "" }: { name: string, size?: number, className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Heart;
  return <Icon size={size} className={className} />;
};

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}{suffix}
    </span>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

const SobreNos = () => {
  const { data: siteSettings } = useSiteSettings();
  const siteName = siteSettings?.site_name || "Festança Decorações";

  const features = (siteSettings?.about_features || [])
    .filter(f => f.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const stats = (siteSettings?.about_stats || [])
    .filter(s => s.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-background font-display">
      <SEO 
        title="Sobre Nós" 
        description="Conheça a história da Festança Decorações e nossa missão de transformar seus sonhos em momentos mágicos e inesquecíveis."
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >

          <span className="inline-block py-1 px-3 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {siteSettings?.about_header_badge || "Nossa História"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {siteSettings?.about_header_title_1 || "Sobre a"} <span className="text-primary">{siteSettings?.about_header_title_2 || "Festança"}</span>
          </h1>
          <div className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed text-justify md:text-center space-y-4">
            {siteSettings?.about_text ? (
              siteSettings.about_text.split("\n").filter(p => p.trim() !== "").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>
                Nascemos do desejo de transformar momentos especiais em memórias inesquecíveis.
                Desde 2020, ajudamos centenas de famílias a celebrar com elegância, criatividade e muito carinho.
              </p>
            )}
          </div>
        </motion.div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {[
            {
              title: siteSettings?.mission_title || "Nossa Missão",
              text: siteSettings?.about_mission || "Democratizar o acesso a decorações de eventos premium através do aluguel. Acreditamos que todos merecem celebrar com sofisticação, sem comprometer o orçamento."
            },
            {
              title: siteSettings?.vision_title || "Nossa Visão",
              text: siteSettings?.about_vision || "Ser a referência em locação de decoração para eventos no Brasil, reconhecida pela qualidade, inovação e excelência no atendimento."
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="bg-card rounded-2xl border border-primary/10 p-8 space-y-4"
            >
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Por Que Escolher a Festança?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="text-center bg-card rounded-2xl border border-primary/5 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DynamicIcon name={f.icon} className="text-primary" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary/5 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Nossos Números</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={s.id || i}>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  <AnimatedCounter value={Number(s.value.replace(/\D/g, '')) || 0} suffix={s.suffix} />
                </p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SobreNos;
