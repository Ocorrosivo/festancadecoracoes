import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import catInfantGirl from "@/assets/cat-infant-girl.webp";
import catInfantBoy from "@/assets/cat-infant-boy.webp";
import catBabyShower from "@/assets/cat-baby-shower.webp";
import catWedding from "@/assets/cat-wedding.webp";
import catGraduation from "@/assets/cat-graduation.webp";
import catBirthdays from "@/assets/cat-birthdays.webp";
import LazyImage from "./LazyImage";

const categories = [
  { name: "Infantil menina", image: catInfantGirl },
  { name: "Infantil menino", image: catInfantBoy },
  { name: "Chá de bebê", image: catBabyShower },
  { name: "Chá revelação", image: catBabyShower },
  { name: "15 anos", image: catBirthdays },
  { name: "Formatura", image: catGraduation },
  { name: "Casamento", image: catWedding },
  { name: "Chá de casa nova", image: catWedding },
  { name: "Feminina", image: catInfantGirl },
  { name: "Masculina", image: catInfantBoy },
  { name: "Brinquedos", image: catBirthdays },
];

const OccasionCategories = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    AutoScroll({ speed: 0.8, stopOnInteraction: false, stopOnMouseEnter: true })
  ]);

  return (
    <section className="py-12 md:py-20 bg-background relative overflow-hidden">
      {/* Top transition gradient if needed, but Hero already has bottom fade */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 text-center md:text-left">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
              Categorias <span className="text-primary italic">Populares</span>
            </h2>
            <p className="text-muted-foreground text-xs md:text-base max-w-xl mx-auto md:mx-0">
              Encontre a decoração perfeita para o seu tipo de evento em nosso catálogo diversificado.
            </p>
          </div>
          <Link
            className="text-xs md:text-sm font-bold text-primary flex items-center justify-center md:justify-start gap-1.5 hover:gap-2 transition-all group bg-primary/5 px-4 py-2 rounded-full self-center md:self-auto"
            to="/produtos"
          >
            Explorar todas <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {categories.map((cat) => (
              <div key={cat.name} className="flex-[0_0_140px] md:flex-[0_0_180px] min-w-0 px-2">
                <Link
                  to={`/produtos?cat=${encodeURIComponent(cat.name)}`}
                  className="group cursor-pointer text-center space-y-3 p-4 rounded-2xl hover:bg-accent/50 transition-all duration-300 block"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-card shadow-md mx-auto group-hover:shadow-xl group-hover:border-primary/30 transition-all"
                  >
                    <LazyImage
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      src={cat.image}
                    />
                  </motion.div>
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300 uppercase tracking-wider">
                    {cat.name}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccasionCategories;