import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { BookCard } from '../../components/catalog/book-card';
import { FilterChips } from '../../components/catalog/filter-chips';
import { SearchBar } from '../../components/catalog/search-bar';
import { PageShell } from '../../layouts/page-shell';
import { toTitleCase } from '../../lib/string-utils';
import type { Book, CatalogFilters } from '../../types/alma';

interface BooksPageProps {
    books: Book[];
    filters?: CatalogFilters;
    genres?: string[];
}

export default function BooksPage({ books = [], filters = {}, genres = [] }: BooksPageProps) {
    const [searchVal, setSearchVal] = useState(filters.search || '');

    const applyFilters = (newFilters: Partial<CatalogFilters>) => {
        const merged = {
            ...filters,
            ...newFilters,
        };

        // Remove empty parameters
        const cleanParams: Record<string, string> = {};
        if (merged.search && merged.search.trim()) cleanParams.search = merged.search.trim();
        if (merged.genre && merged.genre.trim()) cleanParams.genre = merged.genre.trim();
        if (merged.badge && merged.badge.trim()) cleanParams.badge = merged.badge.trim();

        router.get('/libros', cleanParams, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchChange = (term: string) => {
        setSearchVal(term);
        applyFilters({ search: term });
    };

    const handleSelectGenre = (genre: string | undefined) => {
        applyFilters({ genre: genre || undefined });
    };

    const handleSelectBadge = (badge: string | undefined) => {
        applyFilters({ badge: badge || undefined });
    };

    const handleClearAll = () => {
        setSearchVal('');
        router.get('/libros', {}, { preserveState: true, replace: true });
    };

    const isFiltered = Boolean(filters.search || filters.genre || filters.badge);

    // Groupings for default view (when not filtered)
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

                {/* Controls: Search and Filter Chips */}
                <div className="flex flex-col items-center gap-2">
                    <SearchBar value={searchVal} onChange={handleSearchChange} />
                    <FilterChips
                        genres={genres}
                        selectedGenre={filters.genre}
                        selectedBadge={filters.badge}
                        onSelectGenre={handleSelectGenre}
                        onSelectBadge={handleSelectBadge}
                        onClearAll={handleClearAll}
                    />
                </div>

                {/* Catalog Body */}
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
                    /* Grilla unificada cuando hay filtros aplicados */
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
                    /* Vista por secciones destacadas y géneros cuando no hay filtro activo */
                    <div className="space-y-12">
                        {bestSellers.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-ink border-paper-dark/80 flex items-center gap-2 border-b pb-2 font-serif text-xl font-bold tracking-tight">
                                    <span>🔥</span> Los más vendidos
                                </h2>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                    {bestSellers.map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {novelties.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-ink border-paper-dark/80 flex items-center gap-2 border-b pb-2 font-serif text-xl font-bold tracking-tight">
                                    <span>✨</span> Novedades y Recomendados
                                </h2>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                    {novelties.map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {Object.entries(byGenre).map(([genreName, genreBooks]) => (
                            <div key={genreName} className="space-y-4">
                                <h2 className="text-ink border-paper-dark/80 flex items-center gap-2 border-b pb-2 font-serif text-xl font-bold tracking-tight">
                                    <span>📚</span> {genreName}
                                </h2>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                                    {genreBooks.map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
