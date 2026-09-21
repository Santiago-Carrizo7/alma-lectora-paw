import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { QuickStockModal } from '../../../components/admin/quick-stock-modal';
import { BookThumbnail } from '../../../components/ui/book-thumbnail';
import { AdminLayout } from '../../../layouts/admin-layout';
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
                router.get('/admin/libros', { search, tab: filters.tab }, { preserveState: true, replace: true });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search, filters.search, filters.tab]);

    const handleTabChange = (tab: 'available' | 'archived') => {
        router.get('/admin/libros', { tab, search: '' }, { preserveState: true });
    };

    const handleToggleActive = (book: Book) => {
        router.patch(`/admin/libros/${book.id}/toggle-active`, {}, { preserveScroll: true });
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
            router.patch(
                `/admin/libros/${book.id}/restaurar`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setConfirmState(null);
                        setIsProcessing(false);
                    },
                    onError: () => setIsProcessing(false),
                },
            );
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
            breadcrumbText="Volver al Panel Central"
            breadcrumbHref="/admin"
            action={
                <Link
                    href="/admin/libros/nuevo"
                    className="bg-forest hover:bg-forest-light inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-serif text-xs font-bold text-white shadow-xs transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nuevo Libro
                </Link>
            }
        >
            <Head title="Gestión de Libros - Admin" />

            {/* Tabs and Search Controls */}
            <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                {/* Navigation Tabs */}
                <div className="bg-paper-dark/60 border-paper-dark flex items-center rounded-xl border p-1">
                    <button
                        type="button"
                        onClick={() => handleTabChange('available')}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            !isArchivedTab ? 'bg-paper text-forest font-bold shadow-xs' : 'text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Disponibles</span>
                        <span className="bg-paper-dark text-ink-muted rounded-full px-1.5 py-0.5 font-mono text-[10px]">{counts.available}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('archived')}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            isArchivedTab ? 'bg-paper text-amber font-bold shadow-xs' : 'text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Papelera / Archivados</span>
                        <span className="bg-paper-dark text-ink-muted rounded-full px-1.5 py-0.5 font-mono text-[10px]">{counts.archived}</span>
                    </button>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título, ISBN o autor..."
                        className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 py-2 pr-4 pl-9 text-xs shadow-2xs placeholder:text-stone-400 focus:ring-2 focus:outline-none"
                    />
                    <svg
                        className="absolute top-2.5 left-3 h-4 w-4 text-stone-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                    </svg>
                </div>
            </div>

            {/* Books Table */}
            <div className="bg-paper border-paper-dark/80 overflow-hidden rounded-2xl border shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-paper-dark/70 bg-paper-dark/30 text-ink-muted border-b text-[11px] font-bold tracking-wider uppercase">
                                <th className="w-14 px-4 py-3">Portada</th>
                                <th className="px-4 py-3">Título / ISBN</th>
                                <th className="px-4 py-3">Autores</th>
                                <th className="px-4 py-3">Precio</th>
                                <th className="px-4 py-3 text-center">Stock</th>
                                <th className="px-4 py-3 text-center">Visibilidad</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-paper-dark/50 divide-y text-xs">
                            {books.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-ink-muted space-y-2 py-12 text-center">
                                        <p className="text-ink font-serif text-base">No se encontraron libros</p>
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
                                            <td className="px-4 py-3">
                                                <div className="border-paper-dark bg-paper-dark/40 h-14 w-10 shrink-0 overflow-hidden rounded-md border">
                                                    <BookThumbnail
                                                        src={book.cover_url || book.coverUrl}
                                                        alt={book.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </td>

                                            {/* Title & ISBN */}
                                            <td className="px-4 py-3">
                                                <div className="text-ink hover:text-forest font-serif text-sm font-bold transition-colors">
                                                    {book.title}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-stone-400">
                                                    <span>ISBN: {book.isbn}</span>
                                                    {book.genre && (
                                                        <span className="py-0.2 bg-paper-dark text-ink-muted rounded px-1.5">{book.genre}</span>
                                                    )}
                                                    {book.badge && (
                                                        <span className="py-0.2 bg-forest/10 text-forest rounded px-1.5 font-semibold">
                                                            {book.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Authors */}
                                            <td className="text-ink-muted max-w-xs truncate px-4 py-3 font-medium">{authorsList}</td>

                                            {/* Price & Promos */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-ink font-mono font-bold">{formatPrice(book.price)}</div>
                                                {(book.promo_quantity || book.promoQuantity) && (
                                                    <div className="text-amber text-[10px] font-semibold">
                                                        Promo {book.promo_quantity || book.promoQuantity}x{' '}
                                                        {formatPrice(book.promo_price || book.promoPrice || 0)}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Stock & Tactile button */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${
                                                            book.stock > 0
                                                                ? 'bg-forest/10 text-forest'
                                                                : 'border border-red-200 bg-red-50 text-red-700'
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
                                                            className="hover:text-forest hover:bg-forest/10 cursor-pointer rounded-md p-1 text-stone-400 transition-colors"
                                                            title="Ajustar stock"
                                                        >
                                                            <svg
                                                                className="h-3.5 w-3.5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Visibilidad (is_active) */}
                                            <td className="px-4 py-3 text-center">
                                                {!isArchivedTab ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(book)}
                                                        className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                                                            isVisible
                                                                ? 'bg-forest/15 text-forest hover:bg-forest/25'
                                                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                                        }`}
                                                        title="Click para pausar o activar visibilidad en tienda pública"
                                                    >
                                                        {isVisible ? 'Activo' : 'Pausado'}
                                                    </button>
                                                ) : (
                                                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                                                        Archivado
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                {!isArchivedTab ? (
                                                    <div className="inline-flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/libros/${book.id}/editar`}
                                                            className="text-ink-muted hover:text-ink rounded-lg border border-stone-300 px-2.5 py-1 font-medium transition-colors hover:bg-stone-200/50"
                                                        >
                                                            Editar
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmState({ type: 'archive', book })}
                                                            className="border-amber/30 text-amber hover:bg-amber/10 cursor-pointer rounded-lg border px-2.5 py-1 font-medium transition-colors"
                                                        >
                                                            Archivar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmState({ type: 'restore', book })}
                                                            className="bg-forest/10 text-forest hover:bg-forest/20 cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors"
                                                        >
                                                            Restaurar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmState({ type: 'force-delete', book })}
                                                            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
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
                    <div className="border-paper-dark/70 bg-paper-dark/15 text-ink-muted flex flex-col items-center justify-between gap-4 border-t p-4 text-xs sm:flex-row">
                        <div>
                            Mostrando <span className="text-ink font-bold">{books.from ?? 0}</span> a{' '}
                            <span className="text-ink font-bold">{books.to ?? 0}</span> de <span className="text-ink font-bold">{books.total}</span>{' '}
                            libros
                        </div>

                        <div className="flex items-center gap-1">
                            {books.links.map((link, idx) => {
                                const cleanLabel = link.label.replace('&laquo; Previous', '← Anterior').replace('Next &raquo;', 'Siguiente →');

                                if (!link.url) {
                                    return (
                                        <span
                                            key={idx}
                                            className="cursor-not-allowed rounded-lg px-3 py-1.5 text-stone-400 opacity-50 select-none"
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
                                        className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                                            link.active ? 'bg-forest font-bold text-white' : 'hover:bg-paper-dark text-ink'
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
            <QuickStockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} book={selectedBookForStock} />

            {/* Confirmation Modal */}
            {confirmState && (
                <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-xl">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            {confirmState.type === 'archive' && '¿Archivar libro?'}
                            {confirmState.type === 'restore' && '¿Restaurar libro?'}
                            {confirmState.type === 'force-delete' && '¿Eliminar definitivamente?'}
                        </h3>

                        <p className="text-ink-muted text-xs leading-relaxed">
                            {confirmState.type === 'archive' && (
                                <>
                                    El libro <strong className="text-ink">{confirmState.book.title}</strong> será trasladado a la papelera. Dejará de
                                    ser visible en el catálogo público pero podrás restaurarlo cuando desees.
                                </>
                            )}
                            {confirmState.type === 'restore' && (
                                <>
                                    El libro <strong className="text-ink">{confirmState.book.title}</strong> volverá a estar disponible en el
                                    inventario activo.
                                </>
                            )}
                            {confirmState.type === 'force-delete' && (
                                <>
                                    <strong className="text-red-700">Esta acción no se puede deshacer.</strong> El libro{' '}
                                    <strong className="text-ink">{confirmState.book.title}</strong> y sus relaciones con autores se borrarán
                                    definitivamente de la base de datos.
                                </>
                            )}
                        </p>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmState(null)}
                                disabled={isProcessing}
                                className="text-ink-muted flex-1 cursor-pointer rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-stone-200/50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAction}
                                disabled={isProcessing}
                                className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 ${
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
