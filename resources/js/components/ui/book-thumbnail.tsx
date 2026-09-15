import { useState } from 'react';

interface BookThumbnailProps {
  src: string | null | undefined;
  title: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  sizes?: string;
}

export function BookThumbnail({
  src,
  title,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px',
}: BookThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-paper-dark border border-stone-300/80 text-stone-400 select-none p-2 ${className}`}
        title={title}
      >
        <svg className="w-8 h-8 text-stone-400/80 mb-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className="text-[9px] font-serif text-ink-muted text-center leading-tight line-clamp-2 max-w-full px-1 break-words">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Portada del libro ${title}`}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export default BookThumbnail;
