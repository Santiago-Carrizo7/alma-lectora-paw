import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { QuickStockModal } from '../../../components/admin/quick-stock-modal';
import { AdminLayout } from '../../../layouts/admin-layout';
import { formatPrice } from '../../../lib/price';
import type { PaginatedData } from '../../../types/alma';

interface AccessoryItem {
    id: string;
    title: string;
    description: string | null;
    price: number | string;
    promo_quantity: number | null;
    promo_price: number | string | null;
    stock: number;
    category: string;
    cover_url: string | null;
    is_active: boolean;
}

interface CategoryItem {
    id: string;
    slug: string;
    label: string;
    emoji: string | null;
}

interface IndexProps {
    accessories: PaginatedData<AccessoryItem>;
    filters: {
        search: string;
        category: string;
        tab: 'available' | 'archived';
    };
    counts: {
        available: number;
        archived: number;
    };
    categories: CategoryItem[];
}

interface ConfirmState {
    type: 'archive' | 'force-delete' | 'restore';
    accessory: AccessoryItem;
}

export function Index({ accessories, filters, counts, categories }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedForStock, setSelectedForStock] = useState<AccessoryItem | null>(null);
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    '/admin/accesorios',
                    { search, category: selectedCategory, tab: filters.tab },
                    { preserveState: true, replace: true, preserveScroll: true },
                );
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, filters.search, filters.tab]);

    const handleCategorySelect = (catSlug: string) => {
        setSelectedCategory(catSlug);
        router.get(
            '/admin/accesorios',
            { search, category: catSlug, tab: filters.tab },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleTabChange = (tab: 'available' | 'archived') => {
        router.get(
            '/admin/accesorios',
            { search, category: selectedCategory, tab },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleToggleActive = (accessory: AccessoryItem) => {
        router.patch(
            `/admin/accesorios/${accessory.id}/toggle-active`,
            {},
            { preserveScroll: true },
        );
    };

    const handleSaveStock = async (newStock: number) => {
        if (!selectedForStock) return;
        setIsProcessing(true);
        router.patch(
            `/admin/accesorios/${selectedForStock.id}/stock`,
            { stock: newStock },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsProcessing(false);
                    setIsStockOpen(false);
                    setSelectedForStock(null);
                },
                onError: () => setIsProcessing(false),
            },
        );
    };

    const handleConfirmAction = () => {
        if (!confirmState) return;
        setIsProcessing(true);
        const { type, accessory } = confirmState;

        if (type === 'archive') {
            router.delete(`/admin/accesorios/${accessory.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmState(null);
                    setIsProcessing(false);
                },
                onError: () => setIsProcessing(false),
            });
        } else if (type === 'restore') {
            router.patch(
                `/admin/accesorios/${accessory.id}/restaurar`,
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
            router.delete(`/admin/accesorios/${accessory.id}/forzar`, {
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
            title="Panel de Accesorios"
            subtitle="Gestión de Velas, Separadores y Modelos 3D"
            breadcrumbText="Volver al Panel Central"
            breadcrumbHref="/admin"
            action={
                <Link
                    href="/admin/accesorios/nuevo"
                    className="bg-forest hover:bg-forest-light inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-serif text-xs font-bold text-white shadow-xs transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nuevo Accesorio
                </Link>
            }
        >
            <Head title="Gestión de Accesorios - Admin" />

            <div className="space-y-4 animate-fade-in">
                {/* Tabs and Search Controls (Identical to Books Index) */}
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
                            <span className="bg-paper-dark text-ink-muted rounded-full px-1.5 py-0.5 font-mono text-[10px]">
                                {counts.available}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('archived')}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                                isArchivedTab ? 'bg-paper text-amber font-bold shadow-xs' : 'text-ink-muted hover:text-ink'
                            }`}
                        >
                            <span>Papelera / Archivados</span>
                            <span className="bg-paper-dark text-ink-muted rounded-full px-1.5 py-0.5 font-mono text-[10px]">
                                {counts.archived}
                            </span>
                        </button>
                    </div>

                    {/* Search input flush with table borders */}
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar accesorio o descripción..."
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

                {/* Category Chips Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => handleCategorySelect('')}
                        className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide border transition-all duration-200 ${
                            selectedCategory === ''
                                ? 'bg-forest border-forest text-stone-100 shadow-2xs'
                                : 'bg-paper border-stone-300 text-stone-600 hover:border-forest/40 hover:text-forest'
                        }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.slug)}
                            className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide border transition-all duration-200 ${
                                selectedCategory === cat.slug
                                    ? 'bg-forest border-forest text-stone-100 shadow-2xs'
                                    : 'bg-paper border-stone-300 text-stone-600 hover:border-forest/40 hover:text-forest'
                            }`}
                        >
                            {cat.emoji ? `${cat.emoji} ${cat.label}` : cat.label}
                        </button>
                    ))}
                </div>

                {/* Accessories Table (Identical Format to Books Table) */}
                <div className="bg-paper border-paper-dark/80 overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-paper-dark/70 bg-paper-dark/30 text-ink-muted border-b text-[11px] font-bold tracking-wider uppercase">
                                    <th className="w-14 px-3 py-3">Portada</th>
                                    <th className="px-3 py-3">Título / Info</th>
                                    <th className="w-28 px-3 py-3">Categoría</th>
                                    <th className="w-28 px-3 py-3">Precio</th>
                                    <th className="w-24 px-3 py-3 text-center">Stock</th>
                                    <th className="w-24 px-3 py-3 text-center">Visibilidad</th>
                                    <th className="w-36 px-3 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-paper-dark/50 divide-y text-xs">
                                {accessories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-ink-muted space-y-2 py-12 text-center">
                                            <p className="text-ink font-serif text-base">No se encontraron accesorios</p>
                                            <p className="text-xs text-stone-400">
                                                {search ? `Ningún resultado para "${search}".` : 'No hay accesorios en este estado.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    accessories.data.map((acc) => {
                                        const isVisible = acc.is_active;

                                        return (
                                            <tr key={acc.id} className="hover:bg-paper-dark/20 transition-colors">
                                                {/* Thumbnail */}
                                                <td className="px-3 py-3">
                                                    <div className="border-paper-dark bg-paper-dark/40 h-14 w-10 shrink-0 overflow-hidden rounded-md border">
                                                        {acc.cover_url ? (
                                                            <img
                                                                src={acc.cover_url}
                                                                alt={acc.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="text-ink-muted flex h-full w-full items-center justify-center font-serif text-[9px] text-center">
                                                                Sin Foto
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Title & Info */}
                                                <td className="px-3 py-3">
                                                    <div className="text-ink hover:text-forest font-serif text-sm font-bold transition-colors">
                                                        {acc.title}
                                                    </div>
                                                    {acc.description && (
                                                        <div
                                                            className="text-stone-400 mt-0.5 max-w-[180px] sm:max-w-xs truncate text-[11px]"
                                                            title={acc.description.replace(/<[^>]*>/g, '')}
                                                        >
                                                            {acc.description.replace(/<[^>]*>/g, '')}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Category */}
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className="bg-paper-dark text-ink-muted rounded-md px-2 py-0.5 text-[11px] font-semibold">
                                                        {acc.category}
                                                    </span>
                                                </td>

                                                {/* Price & Promo */}
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="text-ink font-mono font-bold">{formatPrice(acc.price)}</div>
                                                    {acc.promo_quantity && acc.promo_price && (
                                                        <div className="text-amber text-[10px] font-semibold">
                                                            Promo {acc.promo_quantity}x {formatPrice(acc.promo_price)}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Stock & Quick Tactile Adjuster */}
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${
                                                                acc.stock > 0
                                                                    ? 'bg-forest/10 text-forest'
                                                                    : 'border border-red-200 bg-red-50 text-red-700'
                                                            }`}
                                                        >
                                                            {acc.stock} un.
                                                        </span>
                                                        {!isArchivedTab && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedForStock(acc);
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

                                                {/* Visibility */}
                                                <td className="px-3 py-3 text-center">
                                                    {!isArchivedTab ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActive(acc)}
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
                                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                                    {!isArchivedTab ? (
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <Link
                                                                href={`/admin/accesorios/${acc.id}/editar`}
                                                                className="text-ink-muted hover:text-ink rounded-lg border border-stone-300 px-2.5 py-1 font-medium transition-colors hover:bg-stone-200/50"
                                                            >
                                                                Editar
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmState({ type: 'archive', accessory: acc })}
                                                                className="border-amber/30 text-amber hover:bg-amber/10 cursor-pointer rounded-lg border px-2.5 py-1 font-medium transition-colors"
                                                            >
                                                                Archivar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmState({ type: 'restore', accessory: acc })}
                                                                className="bg-forest/10 text-forest hover:bg-forest/20 cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors"
                                                            >
                                                                Restaurar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmState({ type: 'force-delete', accessory: acc })}
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

                    {/* Pagination Footer (Identical to Books) */}
                    {accessories.total > 0 && (
                        <div className="border-paper-dark/60 bg-paper-dark/10 text-ink-muted flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-xs sm:flex-row">
                            <div>
                                Mostrando <span className="text-ink font-bold">{accessories.from ?? 0}</span> a{' '}
                                <span className="text-ink font-bold">{accessories.to ?? 0}</span> de{' '}
                                <span className="text-ink font-bold">{accessories.total}</span> accesorios
                            </div>

                            <div className="flex items-center gap-1">
                                {accessories.links.map((link, idx) => {
                                    const cleanLabel = link.label
                                        .replace('&laquo; Previous', '← Anterior')
                                        .replace('Next &raquo;', 'Siguiente →');

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
            </div>

            {/* QuickStock Modal */}
            <QuickStockModal
                isOpen={isStockOpen}
                onClose={() => {
                    setIsStockOpen(false);
                    setSelectedForStock(null);
                }}
                title={selectedForStock?.title}
                subtitle={`Categoría: ${selectedForStock?.category}`}
                initialStock={selectedForStock?.stock ?? 0}
                onSave={handleSaveStock}
                isPending={isProcessing}
            />

            {/* Confirmation Modal */}
            {confirmState && (
                <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-xl">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            {confirmState.type === 'archive' && '¿Archivar accesorio?'}
                            {confirmState.type === 'restore' && '¿Restaurar accesorio?'}
                            {confirmState.type === 'force-delete' && '¿Eliminar definitivamente?'}
                        </h3>

                        <p className="text-ink-muted text-xs leading-relaxed">
                            {confirmState.type === 'archive' && (
                                <>
                                    El accesorio <strong className="text-ink">{confirmState.accessory.title}</strong> será trasladado a la papelera.
                                    Dejará de ser visible en el catálogo público pero podrás restaurarlo cuando desees.
                                </>
                            )}
                            {confirmState.type === 'restore' && (
                                <>
                                    El accesorio <strong className="text-ink">{confirmState.accessory.title}</strong> volverá a estar disponible en el
                                    inventario activo.
                                </>
                            )}
                            {confirmState.type === 'force-delete' && (
                                <>
                                    <strong className="text-red-700">Esta acción no se puede deshacer.</strong> El accesorio{' '}
                                    <strong className="text-ink">{confirmState.accessory.title}</strong> se borrará definitivamente de la base de datos.
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
