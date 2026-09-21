import { Head, Link, router } from '@inertiajs/react';
import { AccessoryCard } from '../../components/catalog/accessory-card';
import { SearchBar } from '../../components/catalog/search-bar';
import { PageShell } from '../../layouts/page-shell';
import { getSectionSlice } from '../../lib/catalog-utils';
import type { Accessory, AccessoryCategory, PaginatedData } from '../../types/alma';

interface AccessoriesPageProps {
    accessories: PaginatedData<Accessory>;
    categories: AccessoryCategory[];
    filters: {
        search?: string;
        category?: string;
    };
}

export function AccessoriesPage({ accessories, categories = [], filters = {} }: AccessoriesPageProps) {
    const applyFilters = (newFilters: { search?: string; category?: string }) => {
        const merged = {
            ...filters,
            ...newFilters,
        };

        const cleanParams: Record<string, string> = {};
        if (merged.search && merged.search.trim()) cleanParams.search = merged.search.trim();
        if (merged.category && merged.category.trim()) cleanParams.category = merged.category.trim();

        router.get('/accesorios', cleanParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (term: string) => {
        applyFilters({ search: term });
    };

    const handleSelectCategory = (catSlug: string) => {
        applyFilters({ category: catSlug });
    };

    const handleViewMoreCategory = (catSlug: string) => {
        applyFilters({ category: catSlug });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const items = accessories?.data || [];
    const currentCategory = filters.category || '';
    const isDefaultView = !filters.category && (!filters.search || !filters.search.trim());

    const accessoriesByCategory = categories.reduce((acc, cat) => {
        const catItems = items.filter(
            (a) =>
                a.category.toLowerCase() === cat.slug.toLowerCase() ||
                a.category.toLowerCase() === cat.label.toLowerCase()
        );
        if (catItems.length > 0) {
            acc.push({
                cat,
                items: catItems,
            });
        }
        return acc;
    }, [] as { cat: (typeof categories)[0]; items: Accessory[] }[]);

    const matchedIds = new Set(accessoriesByCategory.flatMap((g) => g.items.map((i) => i.id)));
    const unmatched = items.filter((a) => !matchedIds.has(a.id));
    if (unmatched.length > 0) {
        accessoriesByCategory.push({
            cat: { id: 'otros', slug: 'otros', label: 'Otros Accesorios', emoji: '✨', order: 999, is_active: true },
            items: unmatched,
        });
    }

    return (
        <PageShell>
            <Head title="Accesorios Literarios | Alma Lectora" />

            <div className="animate-fade-in space-y-8">
                <div className="mx-auto max-w-xl space-y-2 text-center">
                    <h1 className="text-ink font-serif text-3xl font-bold tracking-tight sm:text-4xl">Accesorios Literarios</h1>
                    <p className="font-sans text-sm text-stone-500">
                        Acompañá tus lecturas con velitas aromáticas, señaladores premium y objetos especiales para amantes de los libros.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <SearchBar value={filters.search || ''} onChange={handleSearchChange} />

                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleSelectCategory('')}
                            className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                                currentCategory === ''
                                    ? 'bg-forest border-forest text-white shadow-xs'
                                    : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-700'
                            }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleSelectCategory(cat.slug)}
                                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                                    currentCategory === cat.slug
                                        ? 'bg-forest border-forest text-white shadow-xs'
                                        : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-700'
                                }`}
                            >
                                {cat.emoji ? `${cat.emoji} ${cat.label}` : cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="mx-auto max-w-md space-y-3 py-20 text-center">
                        <div className="text-4xl">📦</div>
                        <h3 className="text-ink font-serif text-lg font-bold">Sin Resultados</h3>
                        <p className="text-sm text-stone-500">No encontramos accesorios que coincidan con la búsqueda o categoría seleccionada.</p>
                        {(filters.search || filters.category) && (
                            <button
                                type="button"
                                onClick={() => {
                                    router.get('/accesorios', {}, { preserveState: true, preserveScroll: true, replace: true });
                                }}
                                className="text-forest cursor-pointer text-xs font-semibold underline"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : isDefaultView ? (
                    <div className="space-y-12">
                        {accessoriesByCategory.map((group) => {
                            const { visible, showMore } = getSectionSlice(group.items, 4, 2);
                            return (
                                <div key={group.cat.slug} className="space-y-4">
                                    <div className="border-paper-dark/60 flex items-center justify-between border-b pb-2">
                                        <h3 className="text-ink font-serif text-lg font-bold tracking-tight">
                                            {group.cat.emoji ? `${group.cat.emoji} ` : ''}{group.cat.label}
                                        </h3>
                                        {showMore && (
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreCategory(group.cat.slug)}
                                                className="text-forest hover:text-forest-light cursor-pointer text-xs font-semibold tracking-wide transition-colors hover:underline"
                                            >
                                                Ver más ({group.items.length}) &rarr;
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                        {visible.map((accessory) => (
                                            <AccessoryCard key={accessory.id} accessory={accessory} />
                                        ))}
                                    </div>
                                    {showMore && (
                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreCategory(group.cat.slug)}
                                                className="text-forest hover:text-forest-light flex cursor-pointer items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                                            >
                                                Ver todos en {group.cat.label} ({group.items.length}) &rarr;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                        {items.map((accessory) => (
                            <AccessoryCard key={accessory.id} accessory={accessory} />
                        ))}
                    </div>
                )}

                {accessories.links && accessories.links.length > 3 && (
                    <div className="border-paper-dark flex items-center justify-center gap-1 border-t pt-6">
                        {accessories.links.map((link, idx) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={idx}
                                        className="rounded-md border border-transparent px-3 py-1.5 text-xs text-stone-400 select-none"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    preserveState
                                    preserveScroll
                                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-forest border-forest text-white shadow-xs'
                                            : 'hover:bg-paper-dark border-stone-200 text-stone-700'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </PageShell>
    );
}

export default AccessoriesPage;
