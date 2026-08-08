import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  images?: string[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

const ImageModal = ({
  isOpen,
  onClose,
  src,
  alt = "Imagem em tela cheia",
  images,
  currentIndex = 0,
  onNavigate,
}: ImageModalProps) => {
  const [scale, setScale] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const resetZoom = useCallback(() => setScale(1), []);

  useEffect(() => {
    if (isOpen) {
      resetZoom();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, src, resetZoom]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && images && onNavigate && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && images && onNavigate && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, images, currentIndex, onNavigate]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => (prev > 1 ? 1 : 2));
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStart.x - touchEndX;
    const diffY = touchStart.y - touchEndY;

    // Horizontal Swipe (Next/Prev)
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) && images && onNavigate) {
      if (diffX > 0 && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (diffX < 0 && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
    }
    // Vertical Swipe Down (Close)
    else if (diffY < -100 && Math.abs(diffY) > Math.abs(diffX)) {
      onClose();
    }

    setTouchStart(null);
  };

  if (!isOpen) return null;

  const activeSrc = images && images[currentIndex] ? images[currentIndex] : src;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            title="Aumentar zoom"
          >
            <ZoomIn size={20} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            title="Diminuir zoom"
          >
            <ZoomOut size={20} />
          </button>
          {scale > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resetZoom(); }}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              title="Resetar zoom"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all backdrop-blur-sm ml-2"
            title="Fechar (ESC)"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Arrows for Multiple Images */}
        {images && images.length > 1 && onNavigate && (
          <>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(currentIndex - 1);
                }}
                className="absolute left-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
                title="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentIndex < images.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(currentIndex + 1);
                }}
                className="absolute right-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
                title="Próximo"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </>
        )}

        {/* Image Container */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleDoubleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.img
            src={activeSrc}
            alt={alt}
            style={{ transform: `scale(${scale})` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none transition-transform duration-200"
          />
        </div>

        {/* Caption */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs sm:text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          {alt} {images && images.length > 1 ? `(${currentIndex + 1}/${images.length})` : ""}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;
