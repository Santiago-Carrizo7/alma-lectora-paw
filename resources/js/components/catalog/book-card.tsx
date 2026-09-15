import React from 'react';
import { Link } from '@inertiajs/react';
import type { Book } from '../../types/alma';
import { BadgeEditorial } from '../ui/badge-editorial';
import { ButtonEditorial } from '../ui/button-editorial';
import { BookThumbnail } from '../ui/book-thumbnail';
import { formatPrice } from '../../lib/price';

interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
}

export const BookCard = React.memo(function BookCard({ book, onAddToCart }: BookCardProps) {
  const isOutOfStock = book.stock === 0;
  const cover = book.coverUrl || book.cover_url;
  const promoQty = book.promoQuantity || book.promo_quantity;
  const promoPrc = book.promoPrice || book.promo_price;

  const authorNames =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.name).join(', ')
      : 'Autor Desconocido';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onAddToCart) {
      onAddToCart(book);
    }
  };

  return (
    <div
      className={`group relative flex flex-col h-full bg-paper-dark/30 rounded-card overflow-hidden border border-paper-dark transition-all duration-300 ${
        isOutOfStock
          ? 'cursor-default opacity-90'
          : 'hover:border-forest/30 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <Link
        href={`/libros/${book.id}`}
        aria-label={isOutOfStock ? `${book.title} - Agotado` : `Ver detalles de ${book.title}`}
        className="flex flex-col flex-1"
      >
        {/* Cover Image Wrapper */}
        <div className="relative aspect-3/4 w-full bg-paper-dark flex items-center justify-center overflow-hidden shadow-inner">
          <BookThumbnail
            src={cover}
            title={book.title}
            loading="lazy"
            decoding="async"
            className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? 'grayscale opacity-40' : ''
            }`}
          />

          {/* Agotado overlay */}
          {isOutOfStock && (
            <>
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="transform -rotate-6 bg-stone-900 border border-stone-100/30 text-stone-100 font-extrabold text-[11px] tracking-wider px-3 py-1.5 shadow-md uppercase select-none rounded-[2px] whitespace-nowrap">
                  AGOTADO
                </div>
              </div>
            </>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 max-w-[85%]">
            {isOutOfStock && <BadgeEditorial variant="agotado" label="Agotado" />}
            {!isOutOfStock && promoQty && promoPrc && (
              <div className="bg-forest border border-amber/40 text-stone-100 text-[10px] font-extrabold px-2 py-0.5 rounded-sm shadow-xs tracking-wide">
                <span>
                  {promoQty}x{formatPrice(promoPrc)}
                </span>
              </div>
            )}
            {!isOutOfStock && book.badge && (
              <BadgeEditorial
                variant={book.badge.toLowerCase().includes('oferta') ? 'oferta' : 'custom'}
                label={book.badge}
              />
            )}
          </div>
        </div>

        {/* Book details */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3
              className={`font-bold text-base text-ink line-clamp-2 leading-snug min-h-[2.75rem] transition-colors duration-200 ${
                isOutOfStock ? '' : 'group-hover:text-forest'
              }`}
              title={book.title}
            >
              {book.title}
            </h3>
            <p className="text-xs text-ink-muted mt-1 italic tracking-wide line-clamp-1">{authorNames}</p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-base font-bold text-amber font-mono">{formatPrice(book.price)}</span>
            <ButtonEditorial
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${book.title} está agotado` : `Ver detalles de ${book.title}`}
              className="text-xs font-semibold py-1.5 px-3"
            >
              {isOutOfStock ? 'Agotado' : 'Ver detalle'}
            </ButtonEditorial>
          </div>
        </div>
      </Link>
    </div>
  );
});

export default BookCard;
