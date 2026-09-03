import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AboutSection = () => {
  const { data: siteSettings } = useSiteSettings();
  const aboutText = siteSettings?.about_text;

  if (!aboutText) return null;

  const paragraphs = aboutText.split("\n").filter((p) => p.trim() !== "");

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Nossa História
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Quem <span className="text-primary">Somos</span>
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed text-justify md:text-center">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
