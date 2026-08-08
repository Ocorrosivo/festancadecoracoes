import { useState } from "react";
import { Eye, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";
import ImageModal from "./ImageModal";

interface ProductCardProps {
  image: string;
  category: string;
  name: string;
  price: string;
  trending?: boolean;
  slug?: string;
}

const ProductCard = ({ image, category, name, price, trending, slug }: ProductCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="group bg-card rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border flex flex-col h-full">
        {/* Image Area with full screen trigger */}
        <div
          className="relative aspect-square overflow-hidden cursor-pointer bg-muted"
          onClick={() => setModalOpen(true)}
          title="Clique para ver a foto em tela cheia"
        >
          <LazyImage
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={image}
          />
          <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-card text-primary px-3 py-1.5 rounded-lg font-semibold text-xs md:text-sm shadow-lg flex items-center gap-1">
              <Maximize2 size={14} /> Ampliar
            </span>
          </div>
          {trending && (
            <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-primary text-primary-foreground text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded uppercase tracking-widest z-10">
              Tendência
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-5 flex flex-col flex-1 justify-between">
          <div>
            <p className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">{category}</p>
            <h3 className="font-bold text-xs md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem] md:min-h-0">
              {name}
            </h3>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[10px] text-muted-foreground">A partir de</span>
              <span className="text-sm md:text-lg font-bold text-primary">{price}</span>
            </div>
            <Link
              to={slug ? `/produto/${slug}` : "#"}
              className="w-full h-9 md:h-11 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-bold rounded-lg md:rounded-xl text-[11px] md:text-sm flex items-center justify-center gap-1.5"
            >
              Ver Detalhes <Eye size={14} className="hidden sm:block" />
            </Link>
          </div>
        </div>
      </div>

      {/* Image Full Screen Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        src={image}
        alt={name}
      />
    </>
  );
};

export default ProductCard;
