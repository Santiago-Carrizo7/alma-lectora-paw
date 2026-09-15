import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '../../../layouts/admin-layout';
import { QuickStockModal } from '../../../components/admin/quick-stock-modal';
import { BookThumbnail } from '../../../components/ui/book-thumbnail';
import { formatPrice } from '../../../lib/price';
import type { Book, PaginatedData } from '../../../types/alma';

interface IndexProps {
  books: PaginatedData<Book>;
  filters: {
    search: string;
    tab: 'available' | 'archived';
  };
  counts: {
    available: number;
    archived: number;
  };
}

interface ConfirmState {
  type: 'archive' | 'force-delete' | 'restore';
  book: Book;
}

export function Index({ books, filters, counts }: IndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedBookForStock, setSelectedBookForStock] = useState<Book | null>(null);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters.search || '')) {
        router.get(
          '/admin/libros',
          { search, tab: filters.tab },
          { preserveState: true, replace: true }
        );
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const handleTabChange = (tab: 'available' | 'archived') => {
    router.get(
      '/admin/libros',
      { tab, search: '' },
      { preserveState: true }
    );
  };

  const handleToggleActive = (book: Book) => {
    router.patch(
      `/admin/libros/${book.id}/toggle-active`,
      {},
      { preserveScroll: true }
    );
  };

  const handleConfirmAction = () => {
    if (!confirmState) return;
    setIsProcessing(true);

    const { type, book } = confirmState;

    if (type === 'archive') {
      router.delete(`/admin/libros/${book.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setConfirmState(null);
          setIsProcessing(false);
        },
        onError: () => setIsProcessing(false),
      });
    } else if (type === 'restore') {
      router.patch(`/admin/libros/${book.id}/restaurar`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          setConfirmState(null);
          setIsProcessing(false);
        },
        onError: () => setIsProcessing(false),
      });
    } else if (type === 'force-delete') {
      router.delete(`/admin/libros/${book.id}/forzar`, {
        preserveScroll: true,
        onSuccess: () => {
          setConfirmState(null);
          setIsProcessing(false);
        },
        onError: () => setIsProcessing(false),
      });
    }
  };

  const isArchivedTab = filters.tab === 'archived';

  return (
    <AdminLayout
      title="Gestión de Libros"
      subtitle="Control de inventario, catálogo, bajas y ajuste de stock"
      breadcrumbText="Volver al Hub"
      breadcrumbHref="/admin"
      action={
        <Link
          href="/admin/libros/nuevo"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-serif font-bold shadow-xs transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Libro
        </Link>
      }
    >
      <Head title="Gestión de Libros - Admin" />

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-paper-dark/60 rounded-xl border border-paper-dark">
          <button
            type="button"
            onClick={() => handleTabChange('available')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isArchivedTab
                ? 'bg-paper text-forest font-bold shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span>Disponibles</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-paper-dark text-ink-muted font-mono">
              {counts.available}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('archived')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isArchivedTab
                ? 'bg-paper text-amber font-bold shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span>Papelera / Archivados</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-paper-dark text-ink-muted font-mono">
              {counts.archived}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, ISBN o autor..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-paper border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink placeholder:text-stone-400 shadow-2xs"
          />
          <svg
            className="w-4 h-4 text-stone-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-paper rounded-2xl border border-paper-dark/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-paper-dark/70 bg-paper-dark/30 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-4 w-14">Portada</th>
                <th className="py-3 px-4">Título / ISBN</th>
                <th className="py-3 px-4">Autores</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Visibilidad</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-dark/50 text-xs">
              {books.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted space-y-2">
                    <p className="font-serif text-base text-ink">No se encontraron libros</p>
                    <p className="text-xs text-stone-400">
                      {search ? `Ningún resultado para "${search}".` : 'No hay libros en este estado.'}
                    </p>
                  </td>
                </tr>
              ) : (
                books.data.map((book) => {
                  const authorsList = book.authors?.map((a) => a.name).join(', ') || 'Sin autor';
                  const isVisible = book.is_active ?? book.isActive ?? true;

                  return (
                    <tr key={book.id} className="hover:bg-paper-dark/20 transition-colors">
                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-10 h-14 overflow-hidden rounded-md border border-paper-dark bg-paper-dark/40 shrink-0">
                          <BookThumbnail
                            src={book.cover_url || book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & ISBN */}
                      <td className="py-3 px-4">
                        <div className="font-bold font-serif text-ink text-sm hover:text-forest transition-colors">
                          {book.title}
                        </div>
                        <div className="text-[11px] font-mono text-stone-400 flex items-center gap-2 mt-0.5">
                          <span>ISBN: {book.isbn}</span>
                          {book.genre && (
                            <span className="px-1.5 py-0.2 rounded bg-paper-dark text-ink-muted">
                              {book.genre}
                            </span>
                          )}
                          {book.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-forest/10 text-forest font-semibold">
                              {book.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Authors */}
                      <td className="py-3 px-4 text-ink-muted font-medium max-w-xs truncate">
                        {authorsList}
                      </td>

                      {/* Price & Promos */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold font-mono text-ink">
                          {formatPrice(book.price)}
                        </div>
                        {(book.promo_quantity || book.promoQuantity) && (
                          <div className="text-[10px] text-amber font-semibold">
                            Promo {book.promo_quantity || book.promoQuantity}x{' '}
                            {formatPrice(book.promo_price || book.promoPrice || 0)}
                          </div>
                        )}
                      </td>

                      {/* Stock & Tactile button */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                              book.stock > 0
                                ? 'bg-forest/10 text-forest'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {book.stock} un.
                          </span>
                          {!isArchivedTab && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookForStock(book);
                                setIsStockOpen(true);
                              }}
                              className="p-1 rounded-md text-stone-400 hover:text-forest hover:bg-forest/10 transition-colors cursor-pointer"
                              title="Ajustar stock"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Visibilidad (is_active) */}
                      <td className="py-3 px-4 text-center">
                        {!isArchivedTab ? (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(book)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              isVisible
                                ? 'bg-forest/15 text-forest hover:bg-forest/25'
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                            title="Click para pausar o activar visibilidad en tienda pública"
                          >
                            {isVisible ? 'Activo' : 'Pausado'}
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-400">
                            Archivado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isArchivedTab ? (
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/admin/libros/${book.id}/editar`}
                              className="px-2.5 py-1 rounded-lg border border-stone-300 text-ink-muted hover:text-ink hover:bg-stone-200/50 font-medium transition-colors"
                            >
                              Editar
                            </Link>
                            <button
                              type="button"
                              onClick={() => setConfirmState({ type: 'archive', book })}
                              className="px-2.5 py-1 rounded-lg border border-amber/30 text-amber hover:bg-amber/10 font-medium transition-colors cursor-pointer"
                            >
                              Archivar
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmState({ type: 'restore', book })}
                              className="px-2.5 py-1 rounded-lg bg-forest/10 text-forest hover:bg-forest/20 font-medium transition-colors cursor-pointer"
                            >
                              Restaurar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmState({ type: 'force-delete', book })}
                              className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-medium transition-colors cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {books.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-paper-dark/70 bg-paper-dark/15 text-xs text-ink-muted">
            <div>
              Mostrando <span className="font-bold text-ink">{books.from ?? 0}</span> a{' '}
              <span className="font-bold text-ink">{books.to ?? 0}</span> de{' '}
              <span className="font-bold text-ink">{books.total}</span> libros
            </div>

            <div className="flex items-center gap-1">
              {books.links.map((link, idx) => {
                const cleanLabel = link.label
                  .replace('&laquo; Previous', '← Anterior')
                  .replace('Next &raquo;', 'Siguiente →');

                if (!link.url) {
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-stone-400 opacity-50 cursor-not-allowed select-none"
                      dangerouslySetInnerHTML={{ __html: cleanLabel }}
                    />
                  );
                }

                return (
                  <Link
                    key={idx}
                    href={link.url}
                    preserveState
                    preserveScroll
                    className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                      link.active
                        ? 'bg-forest text-white font-bold'
                        : 'hover:bg-paper-dark text-ink'
                    }`}
                    dangerouslySetInnerHTML={{ __html: cleanLabel }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tactile QuickStock Modal */}
      <QuickStockModal
        isOpen={isStockOpen}
        onClose={() => setIsStockOpen(false)}
        book={selectedBookForStock}
      />

      {/* Confirmation Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-paper border border-paper-dark rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-ink">
              {confirmState.type === 'archive' && '¿Archivar libro?'}
              {confirmState.type === 'restore' && '¿Restaurar libro?'}
              {confirmState.type === 'force-delete' && '¿Eliminar definitivamente?'}
            </h3>

            <p className="text-xs text-ink-muted leading-relaxed">
              {confirmState.type === 'archive' && (
                <>
                  El libro <strong className="text-ink">{confirmState.book.title}</strong> será trasladado a la papelera. Dejará de ser visible en el catálogo público pero podrás restaurarlo cuando desees.
                </>
              )}
              {confirmState.type === 'restore' && (
                <>
                  El libro <strong className="text-ink">{confirmState.book.title}</strong> volverá a estar disponible en el inventario activo.
                </>
              )}
              {confirmState.type === 'force-delete' && (
                <>
                  <strong className="text-red-700">Esta acción no se puede deshacer.</strong> El libro <strong className="text-ink">{confirmState.book.title}</strong> y sus relaciones con autores se borrarán definitivamente de la base de datos.
                </>
              )}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-stone-300 text-ink-muted hover:bg-stone-200/50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50 ${
                  confirmState.type === 'force-delete'
                    ? 'bg-red-700 hover:bg-red-800'
                    : confirmState.type === 'archive'
                    ? 'bg-amber hover:bg-amber/90'
                    : 'bg-forest hover:bg-forest-light'
                }`}
              >
                {isProcessing
                  ? 'Procesando...'
                  : confirmState.type === 'archive'
                  ? 'Archivar'
                  : confirmState.type === 'restore'
                  ? 'Restaurar'
                  : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Index;
