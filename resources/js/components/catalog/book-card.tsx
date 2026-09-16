import { Link } from '@inertiajs/react';
import React from 'react';
import { formatPrice } from '../../lib/price';
import type { Book } from '../../types/alma';
import { BadgeEditorial } from '../ui/badge-editorial';
import { BookThumbnail } from '../ui/book-thumbnail';
import { ButtonEditorial } from '../ui/button-editorial';

interface BookCardProps {
    book: Book;
    onAddToCart?: (book: Book) => void;
}

export const BookCard = React.memo(function BookCard({ book, onAddToCart }: BookCardProps) {
    const isOutOfStock = book.stock === 0;
    const cover = book.coverUrl || book.cover_url;
    const promoQty = book.promoQuantity || book.promo_quantity;
    const promoPrc = book.promoPrice || book.promo_price;

    const authorNames = book.authors && book.authors.length > 0 ? book.authors.map((a) => a.name).join(', ') : 'Autor Desconocido';

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
            className={`group bg-paper-dark/30 rounded-card border-paper-dark relative flex h-full flex-col overflow-hidden border transition-all duration-300 ${
                isOutOfStock ? 'cursor-default opacity-90' : 'hover:border-forest/30 hover:-translate-y-1 hover:shadow-lg'
            }`}
        >
            <Link
                href={`/libros/${book.id}`}
                aria-label={isOutOfStock ? `${book.title} - Agotado` : `Ver detalles de ${book.title}`}
                className="flex flex-1 flex-col"
            >
                {/* Cover Image Wrapper */}
                <div className="bg-paper-dark relative flex aspect-3/4 w-full items-center justify-center overflow-hidden shadow-inner">
                    <BookThumbnail
                        src={cover}
                        title={book.title}
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            isOutOfStock ? 'opacity-40 grayscale' : ''
                        }`}
                    />

                    {/* Agotado overlay */}
                    {isOutOfStock && (
                        <>
                            <div className="pointer-events-none absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]" />
                            <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                                <div className="-rotate-6 transform rounded-[2px] border border-stone-100/30 bg-stone-900 px-3 py-1.5 text-[11px] font-extrabold tracking-wider whitespace-nowrap text-stone-100 uppercase shadow-md select-none">
                                    AGOTADO
                                </div>
                            </div>
                        </>
                    )}

                    {/* Badges Overlay */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex max-w-[85%] flex-col gap-1.5">
                        {isOutOfStock && <BadgeEditorial variant="agotado" label="Agotado" />}
                        {!isOutOfStock && promoQty && promoPrc && (
                            <div className="bg-forest border-amber/40 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-stone-100 shadow-xs">
                                <span>
                                    {promoQty}x{formatPrice(promoPrc)}
                                </span>
                            </div>
                        )}
                        {!isOutOfStock && book.badge && (
                            <BadgeEditorial variant={book.badge.toLowerCase().includes('oferta') ? 'oferta' : 'custom'} label={book.badge} />
                        )}
                    </div>
                </div>

                {/* Book details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                        <h3
                            className={`text-ink line-clamp-2 min-h-[2.75rem] text-base leading-snug font-bold transition-colors duration-200 ${
                                isOutOfStock ? '' : 'group-hover:text-forest'
                            }`}
                            title={book.title}
                        >
                            {book.title}
                        </h3>
                        <p className="text-ink-muted mt-1 line-clamp-1 text-xs tracking-wide italic">{authorNames}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="text-amber font-mono text-base font-bold">{formatPrice(book.price)}</span>
                        <ButtonEditorial
                            size="sm"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            aria-label={isOutOfStock ? `${book.title} está agotado` : `Ver detalles de ${book.title}`}
                            className="px-3 py-1.5 text-xs font-semibold"
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
