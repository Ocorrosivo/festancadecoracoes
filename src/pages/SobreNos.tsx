import { Heart, Award, Users, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoFestanca from "@/assets/logo-festanca.webp";
import SEO from "@/components/SEO";


const features = [
  { icon: Heart, title: "Feito com Amor", desc: "Cada detalhe é pensado com carinho para tornar seu evento único e inesquecível." },
  { icon: Award, title: "Qualidade Premium", desc: "Trabalhamos apenas com materiais de alta qualidade para garantir elegância em cada peça." },
  { icon: Users, title: "Atendimento Personalizado", desc: "Nossa equipe está pronta para entender suas necessidades e criar o cenário perfeito." },
  { icon: Sparkles, title: "Criatividade Sem Limites", desc: "Transformamos ideias em realidade com temas exclusivos e decorações originais." },
];

const stats = [
  { value: 5600, suffix: "+", label: "Eventos Realizados" },
  { value: 200, suffix: "+", label: "Peças no Catálogo" },
  { value: 98, suffix: "%", label: "Clientes Satisfeitos" },
  { value: 4, suffix: "+", label: "Anos de Experiência" },
];

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
          <img src={logoFestanca} alt="Festança Decorações" className="h-24 w-auto mx-auto mb-6 object-contain" />
          <span className="inline-block py-1 px-3 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Nossa História
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre a <span className="text-primary">Festança</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Nascemos do desejo de transformar momentos especiais em memórias inesquecíveis.
            Desde 2020, ajudamos centenas de famílias a celebrar com elegância, criatividade e muito carinho.
          </p>
        </motion.div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {[
            { title: "Nossa Missão", text: "Democratizar o acesso a decorações de eventos premium através do aluguel. Acreditamos que todos merecem celebrar com sofisticação, sem comprometer o orçamento." },
            { title: "Nossa Visão", text: "Ser a referência em locação de decoração para eventos no Brasil, reconhecida pela qualidade, inovação e excelência no atendimento." },
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
                  <f.icon className="text-primary" size={28} />
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
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
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
