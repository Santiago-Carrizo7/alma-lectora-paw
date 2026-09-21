import { Head, router } from '@inertiajs/react';
import { BookCard } from '../../components/catalog/book-card';
import { FilterChips } from '../../components/catalog/filter-chips';
import { SearchBar } from '../../components/catalog/search-bar';
import { PageShell } from '../../layouts/page-shell';
import { getSectionSlice } from '../../lib/catalog-utils';
import { toTitleCase } from '../../lib/string-utils';
import type { Book, CatalogFilters } from '../../types/alma';

interface BooksPageProps {
    books: Book[];
    filters?: CatalogFilters;
    genres?: string[];
}

export default function BooksPage({ books = [], filters = {}, genres = [] }: BooksPageProps) {
    const applyFilters = (newFilters: Partial<CatalogFilters>) => {
        const merged = {
            ...filters,
            ...newFilters,
        };

        const cleanParams: Record<string, string> = {};
        if (merged.search && merged.search.trim()) cleanParams.search = merged.search.trim();
        if (merged.genre && merged.genre.trim()) cleanParams.genre = merged.genre.trim();
        if (merged.badge && merged.badge.trim()) cleanParams.badge = merged.badge.trim();

        router.get('/libros', cleanParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (term: string) => {
        applyFilters({ search: term });
    };

    const handleSelectGenre = (genre: string | undefined) => {
        applyFilters({ genre: genre || undefined });
    };

    const handleSelectBadge = (badge: string | undefined) => {
        applyFilters({ badge: badge || undefined });
    };

    const handleViewMoreBadge = (badge: string) => {
        applyFilters({ badge, genre: undefined });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewMoreGenre = (genre: string) => {
        applyFilters({ genre, badge: undefined });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearAll = () => {
        router.get('/libros', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const isFiltered = Boolean(filters.search || filters.genre || filters.badge);

    const bestSellers = books.filter((b) => b.badge === 'Más vendido');
    const novelties = books.filter((b) => b.badge === 'Novedad' || b.badge === 'Destacado');
    const otherBooks = books.filter((b) => b.badge !== 'Más vendido' && b.badge !== 'Novedad' && b.badge !== 'Destacado');

    const byGenre = otherBooks.reduce(
        (acc, book) => {
            const g = toTitleCase(book.genre) || 'Otras lecturas';
            if (!acc[g]) acc[g] = [];
            acc[g].push(book);
            return acc;
        },
        {} as Record<string, Book[]>,
    );

    return (
        <PageShell>
            <Head title="Nuestros Libros | Alma Lectora">
                <meta
                    name="description"
                    content="Explorá nuestro catálogo completo de libros. Filtrá por tus géneros favoritos o buscá por título y autor."
                />
            </Head>

            <div className="animate-fade-in space-y-8">
                {/* Header Hero */}
                <div className="mx-auto max-w-xl space-y-2 text-center">
                    <h1 className="text-ink font-serif text-3xl font-bold tracking-tight sm:text-4xl">Nuestros Libros</h1>
                    <p className="font-sans text-sm text-stone-500">
                        Explorá nuestra biblioteca completa. Podés seleccionar tus géneros o novedades favoritas.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <SearchBar value={filters.search || ''} onChange={handleSearchChange} />
                    <FilterChips
                        genres={genres}
                        selectedGenre={filters.genre}
                        selectedBadge={filters.badge}
                        onSelectGenre={handleSelectGenre}
                        onSelectBadge={handleSelectBadge}
                        onClearAll={handleClearAll}
                    />
                </div>

                {books.length === 0 ? (
                    <div className="mx-auto max-w-md py-20 text-center">
                        <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <h3 className="text-ink mt-4 font-serif text-lg font-bold">Sin Resultados</h3>
                        <p className="mt-1.5 text-sm text-stone-500">No encontramos libros que coincidan con los criterios de búsqueda.</p>
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-forest mt-4 inline-flex cursor-pointer items-center text-xs font-semibold hover:underline"
                        >
                            Ver todos los libros
                        </button>
                    </div>
                ) : isFiltered ? (
                    <div className="space-y-4">
                        <div className="border-paper-dark/80 flex items-center justify-between border-b pb-2">
                            <span className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
                            </span>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-forest cursor-pointer text-xs font-semibold hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {bestSellers.length > 0 && (() => {
                            const { visible, showMore } = getSectionSlice(bestSellers, 4, 2);
                            return (
                                <div className="space-y-4">
                                    <div className="border-paper-dark/80 flex items-center justify-between border-b pb-2">
                                        <h2 className="text-ink flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
                                            <span>🔥</span> Los más vendidos
                                        </h2>
                                        {showMore && (
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreBadge('Más vendido')}
                                                className="text-forest hover:text-forest-light cursor-pointer text-xs font-semibold tracking-wide transition-colors hover:underline"
                                            >
                                                Ver más ({bestSellers.length}) &rarr;
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                        {visible.map((book) => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </div>
                                    {showMore && (
                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreBadge('Más vendido')}
                                                className="text-forest hover:text-forest-light flex cursor-pointer items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                                            >
                                                Ver todos los más vendidos ({bestSellers.length}) &rarr;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {novelties.length > 0 && (() => {
                            const { visible, showMore } = getSectionSlice(novelties, 4, 2);
                            return (
                                <div className="space-y-4">
                                    <div className="border-paper-dark/80 flex items-center justify-between border-b pb-2">
                                        <h2 className="text-ink flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
                                            <span>✨</span> Novedades y Recomendados
                                        </h2>
                                        {showMore && (
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreBadge('Novedad')}
                                                className="text-forest hover:text-forest-light cursor-pointer text-xs font-semibold tracking-wide transition-colors hover:underline"
                                            >
                                                Ver más ({novelties.length}) &rarr;
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                        {visible.map((book) => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </div>
                                    {showMore && (
                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreBadge('Novedad')}
                                                className="text-forest hover:text-forest-light flex cursor-pointer items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                                            >
                                                Ver todas las novedades ({novelties.length}) &rarr;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {Object.entries(byGenre).map(([genreName, genreBooks]) => {
                            const { visible, showMore } = getSectionSlice(genreBooks, 4, 2);
                            return (
                                <div key={genreName} className="space-y-4">
                                    <div className="border-paper-dark/80 flex items-center justify-between border-b pb-2">
                                        <h2 className="text-ink flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
                                            <span>📚</span> {genreName}
                                        </h2>
                                        {showMore && (
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreGenre(genreName)}
                                                className="text-forest hover:text-forest-light cursor-pointer text-xs font-semibold tracking-wide transition-colors hover:underline"
                                            >
                                                Ver más ({genreBooks.length}) &rarr;
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                        {visible.map((book) => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </div>
                                    {showMore && (
                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleViewMoreGenre(genreName)}
                                                className="text-forest hover:text-forest-light flex cursor-pointer items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                                            >
                                                Ver todos en {genreName} ({genreBooks.length}) &rarr;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
