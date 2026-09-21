import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { ImageCarousel } from '../../components/ui/image-carousel';
import { PageShell } from '../../layouts/page-shell';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { Book } from '../../types/alma';

interface BookDetailPageProps {
    book: Book;
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
    const [addedToast, setAddedToast] = useState(false);
    const { addItem, openCart } = useCart();
    const isOutOfStock = book.stock === 0;
    const cover = book.coverUrl || book.cover_url;
    const promoQty = book.promoQuantity || book.promo_quantity;
    const promoPrc = book.promoPrice || book.promo_price;

    const authorNames =
        book.authors && book.authors.length > 0
            ? book.authors.map((a) => a.name).join(', ')
            : 'Autor Desconocido';

    const allImages = [cover, ...(book.additional_images || [])].filter(Boolean) as string[];

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem({
            id: book.id,
            type: 'BOOK',
            title: book.title,
            author: authorNames,
            coverUrl: cover,
            price: book.price,
            promoQuantity: promoQty,
            promoPrice: promoPrc,
            stock: book.stock,
        });
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
        openCart();
    };

    return (
        <PageShell>
            <Head title={`${book.title} — ${authorNames} | Alma Lectora`}>
                <meta
                    name="description"
                    content={
                        book.synopsis
                            ? book.synopsis.substring(0, 155).replace(/<[^>]*>?/gm, '')
                            : `Descubrí ${book.title} en Alma Lectora.`
                    }
                />
            </Head>

            <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
                <Link
                    href="/libros"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline uppercase tracking-wider"
                >
                    ← Volver a todos los libros
                </Link>

                <div className="flex flex-col md:grid md:grid-cols-5 gap-8">
                    <div className="md:col-span-2 flex justify-center items-start">
                        <div className="w-full aspect-3/4 rounded-card overflow-hidden shadow-lg border border-paper-dark bg-paper-dark">
                            <ImageCarousel
                                images={allImages}
                                alt={book.title}
                                badge={book.badge}
                                className="w-full h-full"
                                outOfStock={isOutOfStock}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col justify-between space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight leading-tight">
                                {book.title}
                            </h1>
                            <p className="text-base text-forest font-semibold mt-1.5">{authorNames}</p>
                            <p className="text-xs text-stone-500 font-mono mt-0.5">ISBN: {book.isbn}</p>

                            {promoQty && promoPrc && (
                                <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 flex items-center gap-2 text-xs font-semibold">
                                    <span>
                                        Promoción especial: {promoQty} por {formatPrice(promoPrc)}
                                    </span>
                                </div>
                            )}

                            <div className="mt-6 border-t border-paper-dark pt-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                                    Sinopsis
                                </h4>
                                {book.synopsis ? (
                                    <div
                                        className="text-sm text-stone-700 leading-relaxed font-sans prose max-w-none [&>p]:mb-3 [&>strong]:text-ink [&>strong]:font-bold"
                                        dangerouslySetInnerHTML={{ __html: book.synopsis }}
                                    />
                                ) : (
                                    <p className="text-sm text-stone-400 italic">
                                        No hay sinopsis disponible para este libro.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-paper-dark pt-6 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                                    Precio
                                </span>
                                <span className="text-3xl font-extrabold text-amber font-mono mt-0.5">
                                    {formatPrice(book.price)}
                                </span>
                            </div>

                            <ButtonEditorial
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="font-semibold flex items-center justify-center gap-2 py-3 px-6 cursor-pointer"
                            >
                                {isOutOfStock ? (
                                    'Producto Agotado'
                                ) : addedToast ? (
                                    '¡Agregado al Carrito! ✓'
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                            />
                                        </svg>
                                        Agregar al Carrito
                                    </>
                                )}
                            </ButtonEditorial>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
