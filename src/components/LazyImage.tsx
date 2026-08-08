import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholderSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E",
  ...props 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className={cn("overflow-hidden relative", className)}>
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-all duration-700 ease-in-out w-full h-full object-cover",
          !isLoaded ? "scale-105 blur-lg" : "scale-100 blur-0"
        )}
        loading="lazy"
        decoding="async"
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-accent/20 animate-pulse" />
      )}
    </div>
  );
};

export default LazyImage;
