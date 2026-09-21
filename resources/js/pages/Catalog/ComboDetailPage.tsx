import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { ImageCarousel } from '../../components/ui/image-carousel';
import { PageShell } from '../../layouts/page-shell';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { Combo } from '../../types/alma';

interface ComboDetailPageProps {
    combo: Combo;
}

export function ComboDetailPage({ combo }: ComboDetailPageProps) {
    const [addedToast, setAddedToast] = useState(false);
    const { addItem, openCart } = useCart();
    const isOutOfStock = combo.stock === 0;
    const cover = combo.coverUrl || combo.cover_url;
    const promoQty = combo.promoQuantity || combo.promo_quantity;
    const promoPrc = combo.promoPrice || combo.promo_price;
    const additionalImages = combo.additionalImages || combo.additional_images || [];

    const allImages = [cover, ...additionalImages].filter(Boolean) as string[];

    const hasLinkedItems =
        (combo.books && combo.books.length > 0) ||
        (combo.accessories && combo.accessories.length > 0);

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem({
            id: combo.id,
            type: 'COMBO',
            title: combo.title,
            coverUrl: cover,
            price: combo.price,
            promoQuantity: promoQty,
            promoPrice: promoPrc,
            stock: combo.stock,
        });
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
        openCart();
    };

    return (
        <PageShell>
            <Head title={`${combo.title} | Alma Lectora`}>
                <meta
                    name="description"
                    content={
                        combo.description
                            ? combo.description.substring(0, 155).replace(/<[^>]*>?/gm, '')
                            : `Descubrí la oferta ${combo.title} en Alma Lectora.`
                    }
                />
            </Head>

            <div className="animate-fade-in mx-auto max-w-4xl space-y-8">
                <Link
                    href="/"
                    className="text-forest inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase hover:underline"
                >
                    ← Volver al inicio
                </Link>

                <div className="flex flex-col gap-8 md:grid md:grid-cols-5">
                    <div className="flex items-start justify-center md:col-span-2">
                        <div className="rounded-card border-paper-dark bg-paper-dark aspect-3/4 w-full overflow-hidden border shadow-lg">
                            <ImageCarousel
                                images={allImages}
                                alt={combo.title}
                                className="h-full w-full"
                                outOfStock={isOutOfStock}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-6 md:col-span-3">
                        <div>
                            <h1 className="text-ink font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                                {combo.title}
                            </h1>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                <span className="bg-amber-100 text-amber-900 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase">
                                    🎁 Combo Promocional
                                </span>
                                {isOutOfStock && (
                                    <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-semibold uppercase">
                                        Agotado
                                    </span>
                                )}
                            </div>

                            {promoQty && promoPrc && (
                                <div className="bg-amber-50 border-amber-200 text-amber-900 mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold">
                                    <span>
                                        Promoción especial: {promoQty} por {formatPrice(promoPrc)}
                                    </span>
                                </div>
                            )}

                            <style>{`
                                .prose-description ul {
                                    list-style-type: disc !important;
                                    padding-left: 1.5rem !important;
                                    margin-top: 0.5rem !important;
                                    margin-bottom: 0.5rem !important;
                                }
                                .prose-description ol {
                                    list-style-type: decimal !important;
                                    padding-left: 1.5rem !important;
                                    margin-top: 0.5rem !important;
                                    margin-bottom: 0.5rem !important;
                                }
                                .prose-description li {
                                    margin-top: 0.25rem !important;
                                    margin-bottom: 0.25rem !important;
                                }
                                .prose-description p {
                                    margin-top: 0.5rem !important;
                                    margin-bottom: 0.5rem !important;
                                }
                                .prose-description strong {
                                    font-weight: 700 !important;
                                    color: #1c1917 !important;
                                }
                            `}</style>

                            <div className="border-paper-dark mt-6 border-t pt-4">
                                <h4 className="text-ink-muted mb-2 text-xs font-semibold tracking-wider uppercase">
                                    Descripción
                                </h4>
                                {combo.description ? (
                                    <div
                                        className="prose-description font-sans text-sm leading-relaxed text-stone-700"
                                        dangerouslySetInnerHTML={{ __html: combo.description }}
                                    />
                                ) : (
                                    <p className="font-sans text-sm italic text-stone-400">
                                        No hay descripción disponible para este combo.
                                    </p>
                                )}
                            </div>

                            {hasLinkedItems && (
                                <div className="border-paper-dark mt-6 border-t pt-4">
                                    <h4 className="text-ink-muted mb-3 text-xs font-semibold tracking-wider uppercase">
                                        Contenido incluido en el paquete
                                    </h4>
                                    <div className="space-y-2">
                                        {combo.books?.map((b) => (
                                            <div
                                                key={b.book_id || b.bookId || b.book?.id}
                                                className="bg-paper-dark/30 border-paper-dark text-ink flex items-center gap-3 rounded-lg border p-2.5 text-xs sm:text-sm"
                                            >
                                                <span className="text-forest shrink-0 font-bold">📖 {b.quantity}x</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-ink truncate font-semibold">
                                                        {b.book?.title || 'Libro incluido'}
                                                    </p>
                                                    {b.book?.authors && b.book.authors.length > 0 && (
                                                        <p className="text-ink-muted truncate text-[11px] italic">
                                                            {b.book.authors.map((a) => a.name).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {combo.accessories?.map((a) => (
                                            <div
                                                key={a.accessory_id || a.accessoryId || a.accessory?.id}
                                                className="bg-paper-dark/30 border-paper-dark text-ink flex items-center gap-3 rounded-lg border p-2.5 text-xs sm:text-sm"
                                            >
                                                <span className="text-amber shrink-0 font-bold">✨ {a.quantity}x</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-ink truncate font-semibold">
                                                        {a.accessory?.title || 'Accesorio incluido'}
                                                    </p>
                                                    {a.accessory?.category && (
                                                        <p className="text-ink-muted truncate text-[11px]">
                                                            {a.accessory.category}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-paper-dark flex items-center justify-between gap-4 border-t pt-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                    Precio
                                </span>
                                <span className="text-amber font-mono text-3xl font-extrabold">
                                    {formatPrice(combo.price)}
                                </span>
                            </div>

                            <ButtonEditorial
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="flex shrink-0 cursor-pointer items-center justify-center gap-2 px-6 py-3 font-semibold"
                            >
                                {isOutOfStock ? (
                                    'Producto Agotado'
                                ) : addedToast ? (
                                    '¡Agregado al Carrito! ✓'
                                ) : (
                                    <>
                                        <svg
                                            className="h-5 w-5"
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

export default ComboDetailPage;
