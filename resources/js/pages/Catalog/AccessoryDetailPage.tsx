import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AccessoryCard } from '../../components/catalog/accessory-card';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { ImageCarousel } from '../../components/ui/image-carousel';
import { PageShell } from '../../layouts/page-shell';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { Accessory } from '../../types/alma';

interface AccessoryDetailPageProps {
    accessory: Accessory;
    relatedAccessories: Accessory[];
}

export function AccessoryDetailPage({ accessory, relatedAccessories = [] }: AccessoryDetailPageProps) {
    const [addedToast, setAddedToast] = useState(false);
    const { addItem, openCart } = useCart();
    const isOutOfStock = accessory.stock === 0;
    const cover = accessory.coverUrl || accessory.cover_url;
    const promoQty = accessory.promoQuantity || accessory.promo_quantity;
    const promoPrc = accessory.promoPrice || accessory.promo_price;

    const allImages = [cover, ...(accessory.additional_images || [])].filter(Boolean) as string[];

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem({
            id: accessory.id,
            type: 'ACCESSORY',
            title: accessory.title,
            coverUrl: cover,
            price: accessory.price,
            promoQuantity: promoQty,
            promoPrice: promoPrc,
            stock: accessory.stock,
        });
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
        openCart();
    };

    return (
        <PageShell>
            <Head title={`${accessory.title} | Alma Lectora`}>
                <meta
                    name="description"
                    content={
                        accessory.description
                            ? accessory.description.substring(0, 155).replace(/<[^>]*>?/gm, '')
                            : `Accesorio ${accessory.title} en Alma Lectora.`
                    }
                />
            </Head>

            <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
                <Link
                    href="/accesorios"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline uppercase tracking-wider"
                >
                    ← Volver a todos los accesorios
                </Link>

                <div className="flex flex-col md:grid md:grid-cols-5 gap-8">
                    <div className="md:col-span-2 flex justify-center items-start">
                        <div className="w-full aspect-square rounded-card overflow-hidden shadow-lg border border-paper-dark bg-paper-dark">
                            <ImageCarousel
                                images={allImages}
                                alt={accessory.title}
                                className="w-full h-full"
                                outOfStock={isOutOfStock}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col justify-between space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight leading-tight">
                                {accessory.title}
                            </h1>
                            <p className="text-xs uppercase font-bold text-forest mt-1.5">{accessory.category}</p>

                            {promoQty && promoPrc && (
                                <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 flex items-center gap-2 text-xs font-semibold">
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

                            <div className="mt-6 border-t border-paper-dark pt-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                                    Descripción
                                </h4>
                                {accessory.description ? (
                                    <div
                                        className="prose-description text-sm text-stone-700 leading-relaxed font-sans"
                                        dangerouslySetInnerHTML={{ __html: accessory.description }}
                                    />
                                ) : (
                                    <p className="text-sm text-stone-400 italic">Sin descripción disponible.</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-paper-dark pt-6 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                                    Precio
                                </span>
                                <span className="text-3xl font-extrabold text-amber font-mono mt-0.5">
                                    {formatPrice(accessory.price)}
                                </span>
                            </div>

                            <ButtonEditorial
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="font-semibold flex items-center justify-center gap-2 py-3 px-6 cursor-pointer"
                            >
                                {isOutOfStock ? (
                                    'Agotado'
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

                {relatedAccessories.length > 0 && (
                    <div className="space-y-4 pt-10 border-t border-paper-dark">
                        <h3 className="text-ink font-serif text-xl font-bold tracking-tight">Accesorios Relacionados</h3>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {relatedAccessories.map((item) => (
                                <AccessoryCard key={item.id} accessory={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageShell>
    );
}

export default AccessoryDetailPage;
