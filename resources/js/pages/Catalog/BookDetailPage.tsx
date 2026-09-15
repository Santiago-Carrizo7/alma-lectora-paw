import { Head, Link } from '@inertiajs/react';
import type { Book } from '../../types/alma';
import { PageShell } from '../../layouts/page-shell';
import { BadgeEditorial } from '../../components/ui/badge-editorial';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { ImageCarousel } from '../../components/ui/image-carousel';
import { formatPrice } from '../../lib/price';

interface BookDetailPageProps {
  book: Book;
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
  const isOutOfStock = book.stock === 0;
  const cover = book.coverUrl || book.cover_url;
  const promoQty = book.promoQuantity || book.promo_quantity;
  const promoPrc = book.promoPrice || book.promo_price;

  const authorNames =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.name).join(', ')
      : 'Autor Desconocido';

  const allImages = [cover, ...(book.additional_images || [])].filter(Boolean) as string[];

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Estoy interesado en el libro "${book.title}" (ISBN: ${book.isbn}) que vi en el catálogo de Alma Lectora.`
  );
  const whatsappUrl = `https://wa.me/5493876235245?text=${whatsappMessage}`;

  return (
    <PageShell>
      <Head title={`${book.title} | Alma Lectora`}>
        <meta
          name="description"
          content={`Detalle del libro ${book.title} de ${authorNames}. Disponible en Alma Lectora.`}
        />
      </Head>

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            href="/libros"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-forest transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        {/* Book Container Card */}
        <div className="bg-surface rounded-2xl border border-paper-dark p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:grid md:grid-cols-5 gap-8">
            {/* Left: Cover Carousel */}
            <div className="md:col-span-2 flex justify-center items-start">
              <div className="w-full max-w-xs md:max-w-none aspect-3/4 rounded-card overflow-hidden shadow-md border border-paper-dark bg-paper-dark">
                <ImageCarousel
                  images={allImages}
                  alt={book.title}
                  badge={book.badge}
                  outOfStock={isOutOfStock}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Right: Book Details */}
            <div className="md:col-span-3 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Badges & Stock */}
                <div className="flex flex-wrap items-center gap-2">
                  {book.genre && (
                    <span className="text-xs font-semibold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
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
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-base text-forest font-semibold mt-1">{authorNames}</p>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">ISBN: {book.isbn}</p>
                </div>

                {/* Price & Promos */}
                <div className="pt-2 border-t border-paper-dark space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-amber font-mono">
                      {formatPrice(book.price)}
                    </span>
                  </div>

                  {promoQty && promoPrc && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
                      <span>🏷️</span>
                      <span>
                        Promoción especial: {promoQty} por {formatPrice(promoPrc)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Synopsis */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Sinopsis
                  </h3>
                  <div className="text-sm text-stone-600 leading-relaxed space-y-2 whitespace-pre-line font-sans">
                    {book.synopsis || 'Sin sinopsis disponible para este ejemplar.'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-paper-dark flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1"
                >
                  <ButtonEditorial
                    variant="whatsapp"
                    size="lg"
                    className="w-full justify-center text-sm py-3"
                  >
                    <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                    </svg>
                    Consultar por WhatsApp
                  </ButtonEditorial>
                </a>

                <Link href="/libros" className="w-full sm:w-auto">
                  <ButtonEditorial variant="ghost" size="lg" className="w-full justify-center text-sm py-3">
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
