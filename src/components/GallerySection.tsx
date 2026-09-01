import { useState } from "react";
import LazyImage from "./LazyImage";
import ImageModal from "./ImageModal";
import { useGallery } from "@/hooks/useGallery";

const GallerySection = () => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const { data: galleryData } = useGallery();

  const titleParts = galleryData?.title.split('*') || ["Nossa ", "Arte em Detalhes", ""];
  const images = galleryData?.images || [];
  const imageSources = images.map((img) => img.src);

  return (
    <section className="py-12 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-5xl font-bold mb-4 tracking-tight">
            {titleParts[0]}<span className="text-primary italic">{titleParts[1]}</span>{titleParts[2]}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto italic font-medium text-base md:text-lg leading-relaxed px-4 md:px-0">
            {galleryData?.quote}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setModalIndex(i)}
              className={`aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                i % 2 !== 0 ? "md:translate-y-8" : ""
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
