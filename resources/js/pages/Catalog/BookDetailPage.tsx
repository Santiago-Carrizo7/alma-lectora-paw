import { Head, Link } from '@inertiajs/react';
import { BadgeEditorial } from '../../components/ui/badge-editorial';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { ImageCarousel } from '../../components/ui/image-carousel';
import { PageShell } from '../../layouts/page-shell';
import { formatPrice } from '../../lib/price';
import type { Book } from '../../types/alma';

interface BookDetailPageProps {
    book: Book;
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
    const isOutOfStock = book.stock === 0;
    const cover = book.coverUrl || book.cover_url;
    const promoQty = book.promoQuantity || book.promo_quantity;
    const promoPrc = book.promoPrice || book.promo_price;

    const authorNames = book.authors && book.authors.length > 0 ? book.authors.map((a) => a.name).join(', ') : 'Autor Desconocido';

    const allImages = [cover, ...(book.additional_images || [])].filter(Boolean) as string[];

    const whatsappMessage = encodeURIComponent(
        `¡Hola! Estoy interesado en el libro "${book.title}" (ISBN: ${book.isbn}) que vi en el catálogo de Alma Lectora.`,
    );
    const whatsappUrl = `https://wa.me/5493876235245?text=${whatsappMessage}`;

    return (
        <PageShell>
            <Head title={`${book.title} | Alma Lectora`}>
                <meta name="description" content={`Detalle del libro ${book.title} de ${authorNames}. Disponible en Alma Lectora.`} />
            </Head>

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Back Link */}
                <div>
                    <Link
                        href="/libros"
                        className="text-ink-muted hover:text-forest inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Volver al catálogo
                    </Link>
                </div>

                {/* Book Container Card */}
                <div className="bg-surface border-paper-dark rounded-2xl border p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col gap-8 md:grid md:grid-cols-5">
                        {/* Left: Cover Carousel */}
                        <div className="flex items-start justify-center md:col-span-2">
                            <div className="rounded-card border-paper-dark bg-paper-dark aspect-3/4 w-full max-w-xs overflow-hidden border shadow-md md:max-w-none">
                                <ImageCarousel
                                    images={allImages}
                                    alt={book.title}
                                    badge={book.badge}
                                    outOfStock={isOutOfStock}
                                    className="h-full w-full"
                                />
                            </div>
                        </div>

                        {/* Right: Book Details */}
                        <div className="flex flex-col justify-between space-y-6 md:col-span-3">
                            <div className="space-y-4">
                                {/* Badges & Stock */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {book.genre && (
                                        <span className="text-forest bg-forest/10 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                            {book.genre}
                                        </span>
                                    )}
                                    {book.badge && (
                                        <BadgeEditorial
                                            variant={book.badge.toLowerCase().includes('oferta') ? 'oferta' : 'custom'}
                                            label={book.badge}
                                        />
                                    )}
                                    {isOutOfStock ? (
                                        <BadgeEditorial variant="agotado" label="Sin Stock" />
                                    ) : (
                                        <span className="text-xs text-stone-500">
                                            Disponibles: <strong className="text-ink">{book.stock}</strong> u.
                                        </span>
                                    )}
                                </div>

                                {/* Title & Author */}
                                <div>
                                    <h1 className="text-ink font-serif text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{book.title}</h1>
                                    <p className="text-forest mt-1 text-base font-semibold">{authorNames}</p>
                                    <p className="mt-0.5 font-mono text-xs text-stone-400">ISBN: {book.isbn}</p>
                                </div>

                                {/* Price & Promos */}
                                <div className="border-paper-dark space-y-2 border-t pt-2">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-amber font-mono text-2xl font-bold sm:text-3xl">{formatPrice(book.price)}</span>
                                    </div>

                                    {promoQty && promoPrc && (
                                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                                            <span>🏷️</span>
                                            <span>
                                                Promoción especial: {promoQty} por {formatPrice(promoPrc)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Synopsis */}
                                <div className="pt-2">
                                    <h3 className="text-ink-muted mb-2 text-xs font-bold tracking-wider uppercase">Sinopsis</h3>
                                    <div className="space-y-2 font-sans text-sm leading-relaxed whitespace-pre-line text-stone-600">
                                        {book.synopsis || 'Sin sinopsis disponible para este ejemplar.'}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="border-paper-dark flex flex-col items-center gap-3 border-t pt-6 sm:flex-row">
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full flex-1 sm:w-auto">
                                    <ButtonEditorial variant="whatsapp" size="lg" className="w-full justify-center py-3 text-sm">
                                        <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                                        </svg>
                                        Consultar por WhatsApp
                                    </ButtonEditorial>
                                </a>

                                <Link href="/libros" className="w-full sm:w-auto">
                                    <ButtonEditorial variant="ghost" size="lg" className="w-full justify-center py-3 text-sm">
                                        Explorar más libros
                                    </ButtonEditorial>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
