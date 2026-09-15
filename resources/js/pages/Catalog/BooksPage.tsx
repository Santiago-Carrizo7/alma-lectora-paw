import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import type { Book, CatalogFilters } from '../../types/alma';
import { PageShell } from '../../layouts/page-shell';
import { SearchBar } from '../../components/catalog/search-bar';
import { FilterChips } from '../../components/catalog/filter-chips';
import { BookCard } from '../../components/catalog/book-card';
import { toTitleCase } from '../../lib/string-utils';

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
  const otherBooks = books.filter(
    (b) => b.badge !== 'Más vendido' && b.badge !== 'Novedad' && b.badge !== 'Destacado'
  );

  const byGenre = otherBooks.reduce(
    (acc, book) => {
      const g = toTitleCase(book.genre) || 'Otras lecturas';
      if (!acc[g]) acc[g] = [];
      acc[g].push(book);
      return acc;
    },
    {} as Record<string, Book[]>
  );

  return (
    <PageShell>
      <Head title="Nuestros Libros | Alma Lectora">
        <meta
          name="description"
          content="Explorá nuestro catálogo completo de libros. Filtrá por tus géneros favoritos o buscá por título y autor."
        />
      </Head>

      <div className="space-y-8 animate-fade-in">
        {/* Header Hero */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-ink tracking-tight">Nuestros Libros</h1>
          <p className="text-sm text-stone-500 font-sans">
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
          <div className="py-20 text-center max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-stone-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-4 text-lg font-bold font-serif text-ink">Sin Resultados</h3>
            <p className="text-sm text-stone-500 mt-1.5">
              No encontramos libros que coincidan con los criterios de búsqueda.
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="mt-4 inline-flex items-center text-xs font-semibold text-forest hover:underline cursor-pointer"
            >
              Ver todos los libros
            </button>
          </div>
        ) : isFiltered ? (
          /* Grilla unificada cuando hay filtros aplicados */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-paper-dark/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-forest font-semibold hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <h2 className="text-xl font-bold font-serif text-ink tracking-tight border-b border-paper-dark/80 pb-2 flex items-center gap-2">
                  <span>🔥</span> Los más vendidos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {bestSellers.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}

            {novelties.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-serif text-ink tracking-tight border-b border-paper-dark/80 pb-2 flex items-center gap-2">
                  <span>✨</span> Novedades y Recomendados
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {novelties.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}

            {Object.entries(byGenre).map(([genreName, genreBooks]) => (
              <div key={genreName} className="space-y-4">
                <h2 className="text-xl font-bold font-serif text-ink tracking-tight border-b border-paper-dark/80 pb-2 flex items-center gap-2">
                  <span>📚</span> {genreName}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
