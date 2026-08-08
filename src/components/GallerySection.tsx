import { useState } from "react";
import gallery1 from "@/assets/gallery-1.webp";
import gallery2 from "@/assets/gallery-2.webp";
import gallery3 from "@/assets/gallery-3.webp";
import gallery4 from "@/assets/gallery-4.webp";
import LazyImage from "./LazyImage";
import ImageModal from "./ImageModal";

const images = [
  { src: gallery1, alt: "Flores de casamento" },
  { src: gallery2, alt: "Festa de aniversário", offset: true },
  { src: gallery3, alt: "Jantar elegante" },
  { src: gallery4, alt: "Bolo de festa", offset: true },
];

const GallerySection = () => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const imageSources = images.map((img) => img.src);

  return (
    <section className="py-12 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-5xl font-bold mb-4 tracking-tight">
            Nossa <span className="text-primary italic">Arte em Detalhes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto italic font-medium text-base md:text-lg leading-relaxed px-4 md:px-0">
            "Transformamos espaços em experiências inesquecíveis, cuidando de cada detalhe com amor e dedicação."
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setModalIndex(i)}
              className={`aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                img.offset ? "md:translate-y-8" : ""
              }`}
              title="Clique para expandir em tela cheia"
            >
              <LazyImage
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                src={img.src}
              />
            </div>
          ))}
        </div>
      </div>

      {modalIndex !== null && (
        <ImageModal
          isOpen={modalIndex !== null}
          onClose={() => setModalIndex(null)}
          src={imageSources[modalIndex]}
          alt={images[modalIndex]?.alt}
          images={imageSources}
          currentIndex={modalIndex}
          onNavigate={(index) => setModalIndex(index)}
        />
      )}
    </section>
  );
};

export default GallerySection;
