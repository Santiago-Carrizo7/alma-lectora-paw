import React, { useState } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  badge?: string | null;
  outOfStock?: boolean;
}

export function ImageCarousel({ images, alt, className = '', badge, outOfStock }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className={`bg-paper-dark rounded-lg flex items-center justify-center text-stone-400 font-serif text-sm ${className}`}>
        Sin Imagen
      </div>
    );
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img
        src={validImages[currentIndex]}
        alt={`${alt} - Imagen ${currentIndex + 1}`}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          outOfStock ? 'grayscale opacity-75' : ''
        }`}
      />

      {badge && (
        <span className="absolute top-2.5 left-2.5 bg-amber text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
          {badge}
        </span>
      )}

      {outOfStock && (
        <span className="absolute top-2.5 right-2.5 bg-stone-800/90 text-stone-200 font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
          Agotado
        </span>
      )}

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-all opacity-80 group-hover:opacity-100 focus:outline-none cursor-pointer"
            aria-label="Imagen anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-all opacity-80 group-hover:opacity-100 focus:outline-none cursor-pointer"
            aria-label="Imagen siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'bg-white w-3' : 'bg-white/50'
                }`}
                aria-label={`Ver foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;
