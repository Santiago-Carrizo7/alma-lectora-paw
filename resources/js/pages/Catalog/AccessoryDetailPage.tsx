import { Head, Link } from '@inertiajs/react';
import { AccessoryCard } from '../../components/catalog/accessory-card';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { ImageCarousel } from '../../components/ui/image-carousel';
import { PageShell } from '../../layouts/page-shell';
import { formatPrice } from '../../lib/price';
import type { Accessory } from '../../types/alma';

interface AccessoryDetailPageProps {
    accessory: Accessory;
    relatedAccessories: Accessory[];
}

export function AccessoryDetailPage({ accessory, relatedAccessories = [] }: AccessoryDetailPageProps) {
    const isOutOfStock = accessory.stock === 0;
    const cover = accessory.coverUrl || accessory.cover_url;
    const promoQty = accessory.promoQuantity || accessory.promo_quantity;
    const promoPrc = accessory.promoPrice || accessory.promo_price;

    const allImages = [cover, ...(accessory.additional_images || [])].filter(Boolean) as string[];

    const whatsappMessage = encodeURIComponent(`¡Hola! Estoy interesado en el accesorio "${accessory.title}" que vi en el catálogo de Alma Lectora.`);
    const whatsappUrl = `https://wa.me/5493876235245?text=${whatsappMessage}`;

    return (
        <PageShell>
            <Head title={`${accessory.title} | Alma Lectora`}>
                <meta
                    name="description"
                    content={accessory.description ? accessory.description.substring(0, 155) : `Accesorio ${accessory.title} en Alma Lectora.`}
                />
            </Head>

            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <Link
                        href="/accesorios"
                        className="text-ink-muted hover:text-forest inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Volver a todos los accesorios
                    </Link>
                </div>

                <div className="bg-surface border-paper-dark rounded-2xl border p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col gap-8 md:grid md:grid-cols-5">
                        <div className="flex items-start justify-center md:col-span-2">
                            <div className="rounded-card border-paper-dark bg-paper-dark aspect-square w-full max-w-xs overflow-hidden border shadow-md md:max-w-none">
                                <ImageCarousel images={allImages} alt={accessory.title} className="h-full w-full" outOfStock={isOutOfStock} />
                            </div>
                        </div>

                        <div className="flex flex-col justify-between space-y-6 md:col-span-3">
                            <div className="space-y-3">
                                <span className="text-forest bg-forest/10 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                                    {accessory.category}
                                </span>

                                <h1 className="text-ink font-serif text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{accessory.title}</h1>

                                <div className="flex items-baseline gap-3 pt-2">
                                    <span className="text-amber font-mono text-3xl font-extrabold">{formatPrice(accessory.price)}</span>
                                    {promoQty && promoPrc && (
                                        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                            Promoción {promoQty}x{formatPrice(promoPrc)}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-1">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            isOutOfStock
                                                ? 'border border-red-200 bg-red-50 text-red-700'
                                                : accessory.stock <= 3
                                                  ? 'border border-amber-200 bg-amber-50 text-amber-800'
                                                  : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isOutOfStock ? 'bg-red-500' : accessory.stock <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        />
                                        {isOutOfStock
                                            ? 'Sin stock disponible'
                                            : accessory.stock <= 3
                                              ? `¡Últimas ${accessory.stock} unidades!`
                                              : 'Stock disponible'}
                                    </span>
                                </div>

                                <div className="border-paper-dark space-y-1.5 border-t pt-4">
                                    <h4 className="text-ink-muted text-xs font-semibold tracking-wider uppercase">Descripción</h4>
                                    {accessory.description ? (
                                        <p className="font-sans text-sm leading-relaxed whitespace-pre-line text-stone-700">
                                            {accessory.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-stone-400 italic">Sin descripción disponible.</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-paper-dark border-t pt-6">
                                <a
                                    href={isOutOfStock ? undefined : whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={isOutOfStock ? 'pointer-events-none' : ''}
                                >
                                    <ButtonEditorial
                                        variant="whatsapp"
                                        size="lg"
                                        disabled={isOutOfStock}
                                        className="flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold shadow-sm"
                                    >
                                        {isOutOfStock ? (
                                            'Producto Agotado'
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                                                </svg>
                                                Pedir por WhatsApp
                                            </>
                                        )}
                                    </ButtonEditorial>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedAccessories.length > 0 && (
                    <div className="space-y-4 pt-6">
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
