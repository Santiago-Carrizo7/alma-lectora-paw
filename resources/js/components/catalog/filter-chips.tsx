import { useMemo, useState } from 'react';
import { toTitleCase } from '../../lib/string-utils';
import { Drawer } from '../ui/drawer';
import { SearchableFilterPopover } from './searchable-filter-popover';

interface FilterChipsProps {
    genres: string[];
    authors?: string[];
    selectedGenre?: string;
    selectedBadge?: string;
    selectedAuthor?: string;
    onSelectGenre: (genre: string | undefined) => void;
    onSelectBadge: (badge: string | undefined) => void;
    onSelectAuthor: (author: string | undefined) => void;
    onClearAll: () => void;
}

export function FilterChips({
    genres = [],
    authors = [],
    selectedGenre,
    selectedBadge,
    selectedAuthor,
    onSelectGenre,
    onSelectBadge,
    onSelectAuthor,
    onClearAll,
}: FilterChipsProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [mobileGenreQuery, setMobileGenreQuery] = useState('');
    const [mobileAuthorQuery, setMobileAuthorQuery] = useState('');

    const isAllSelected = !selectedGenre && !selectedBadge && !selectedAuthor;
    const activeCount = (selectedGenre ? 1 : 0) + (selectedBadge ? 1 : 0) + (selectedAuthor ? 1 : 0);
    const hasActiveFilters = activeCount > 0;

    const badges = [
        { id: 'Novedad', label: '✨ Novedades' },
        { id: 'Más vendido', label: '🔥 Más vendidos' },
        { id: 'Destacado', label: '⭐ Destacados' },
    ];

    const filteredMobileGenres = useMemo(() => {
        const q = mobileGenreQuery.trim().toLowerCase();
        if (!q) {
            return selectedGenre ? genres.filter((g) => g.toLowerCase() === selectedGenre.toLowerCase()) : [];
        }
        return genres.filter((g) => toTitleCase(g).toLowerCase().includes(q));
    }, [genres, mobileGenreQuery, selectedGenre]);

    const filteredMobileAuthors = useMemo(() => {
        const q = mobileAuthorQuery.trim().toLowerCase();
        if (!q) {
            return selectedAuthor ? authors.filter((a) => a.toLowerCase() === selectedAuthor.toLowerCase()) : [];
        }
        return authors.filter((a) => a.toLowerCase().includes(q));
    }, [authors, mobileAuthorQuery, selectedAuthor]);

    return (
        <div className="w-full">
            {/* Mobile: Trigger + Active chips + Drawer */}
            <div className="flex w-full flex-col items-center gap-3 px-4 sm:hidden">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide shadow-xs transition-all duration-200 ${
                            hasActiveFilters
                                ? 'bg-forest border-forest text-stone-100'
                                : 'bg-paper text-ink hover:border-forest/40 border-stone-300'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                        <span>Filtrar catálogo</span>
                        {activeCount > 0 && (
                            <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                {activeCount}
                            </span>
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="rounded-full px-3 py-2 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {selectedBadge && (
                            <span
                                onClick={() => onSelectBadge(undefined)}
                                className="bg-forest/10 text-forest border-forest/20 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                            >
                                {selectedBadge}
                                <span className="text-forest/70 ml-0.5 font-bold">×</span>
                            </span>
                        )}
                        {selectedGenre && (
                            <span
                                onClick={() => onSelectGenre(undefined)}
                                className="bg-forest/10 text-forest border-forest/20 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                            >
                                {toTitleCase(selectedGenre)}
                                <span className="text-forest/70 ml-0.5 font-bold">×</span>
                            </span>
                        )}
                        {selectedAuthor && (
                            <span
                                onClick={() => onSelectAuthor(undefined)}
                                className="bg-forest/10 text-forest border-forest/20 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                            >
                                {selectedAuthor}
                                <span className="text-forest/70 ml-0.5 font-bold">×</span>
                            </span>
                        )}
                    </div>
                )}

                <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Filtrar Libros">
                    <div className="space-y-6 pb-6">
                        <div className="border-paper-dark flex items-center justify-between border-b pb-3">
                            <span className="text-xs font-medium text-stone-500">
                                {activeCount === 0 ? 'Sin filtros activos' : `${activeCount} seleccionado(s)`}
                            </span>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={onClearAll}
                                    className="text-forest cursor-pointer text-xs font-semibold hover:underline"
                                >
                                    Limpiar todos
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold tracking-wider text-stone-400 uppercase">Colecciones</h4>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={onClearAll}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                                        isAllSelected
                                            ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                            : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                                    }`}
                                >
                                    <span>Todos los libros</span>
                                </button>

                                {badges.map((b) => {
                                    const isSelected = selectedBadge?.toLowerCase() === b.id.toLowerCase();
                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => onSelectBadge(isSelected ? undefined : b.id)}
                                            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                                    : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                                            }`}
                                        >
                                            <span>{b.label}</span>
                                            {isSelected && (
                                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {genres.length > 0 && (
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold tracking-wider text-stone-400 uppercase">Géneros Literarios</h4>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={mobileGenreQuery}
                                        onChange={(e) => setMobileGenreQuery(e.target.value)}
                                        placeholder="Escribí para buscar género..."
                                        className="bg-paper-dark/40 focus:border-forest w-full rounded-lg border border-stone-300 py-1.5 pr-8 pl-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none"
                                    />
                                    {mobileGenreQuery && (
                                        <button
                                            type="button"
                                            aria-label="Limpiar búsqueda de género"
                                            onClick={() => setMobileGenreQuery('')}
                                            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-xs font-bold text-stone-400 hover:text-stone-600"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {mobileGenreQuery.trim().length > 0 && filteredMobileGenres.length === 0 ? (
                                    <p className="text-xs text-stone-400">Sin coincidencias</p>
                                ) : (
                                    filteredMobileGenres.length > 0 && (
                                        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                                            {filteredMobileGenres.map((genre) => {
                                                const isSelected = selectedGenre?.toLowerCase() === genre.toLowerCase();
                                                return (
                                                    <button
                                                        key={genre}
                                                        type="button"
                                                        onClick={() => onSelectGenre(isSelected ? undefined : genre)}
                                                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                                                : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                                                        }`}
                                                    >
                                                        <span>{toTitleCase(genre)}</span>
                                                        {isSelected && (
                                                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {authors.length > 0 && (
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold tracking-wider text-stone-400 uppercase">Autores</h4>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={mobileAuthorQuery}
                                        onChange={(e) => setMobileAuthorQuery(e.target.value)}
                                        placeholder="Escribí para buscar autor..."
                                        className="bg-paper-dark/40 focus:border-forest w-full rounded-lg border border-stone-300 py-1.5 pr-8 pl-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none"
                                    />
                                    {mobileAuthorQuery && (
                                        <button
                                            type="button"
                                            aria-label="Limpiar búsqueda de autor"
                                            onClick={() => setMobileAuthorQuery('')}
                                            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-xs font-bold text-stone-400 hover:text-stone-600"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {mobileAuthorQuery.trim().length > 0 && filteredMobileAuthors.length === 0 ? (
                                    <p className="text-xs text-stone-400">Sin coincidencias</p>
                                ) : (
                                    filteredMobileAuthors.length > 0 && (
                                        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                                            {filteredMobileAuthors.map((author) => {
                                                const isSelected = selectedAuthor?.toLowerCase() === author.toLowerCase();
                                                return (
                                                    <button
                                                        key={author}
                                                        type="button"
                                                        onClick={() => onSelectAuthor(isSelected ? undefined : author)}
                                                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                                                : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                                                        }`}
                                                    >
                                                        <span>{author}</span>
                                                        {isSelected && (
                                                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <div className="border-paper-dark border-t pt-4">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="bg-forest hover:bg-forest-light w-full cursor-pointer rounded-md py-2.5 text-sm font-semibold text-stone-100 shadow-xs transition-colors"
                            >
                                Ver libros
                            </button>
                        </div>
                    </div>
                </Drawer>
            </div>

            {/* Desktop: 2-tier layout (Fixed Collections row + Searchable Popovers for Género & Autor) */}
            <div className="hidden flex-col items-center gap-3 px-2 sm:flex">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={onClearAll}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                            isAllSelected
                                ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                        }`}
                    >
                        <span>Todos los libros</span>
                    </button>

                    {badges.map((b) => {
                        const isSelected = selectedBadge?.toLowerCase() === b.id.toLowerCase();
                        return (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => onSelectBadge(isSelected ? undefined : b.id)}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                                    isSelected
                                        ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                        : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                                }`}
                            >
                                <span>{b.label}</span>
                                {isSelected && (
                                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                                        ✓
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {(genres.length > 0 || authors.length > 0) && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {genres.length > 0 && (
                            <SearchableFilterPopover
                                label="Género"
                                searchPlaceholder="Buscar género..."
                                items={genres}
                                selectedValue={selectedGenre}
                                formatItem={toTitleCase}
                                onSelect={onSelectGenre}
                                columns={2}
                            />
                        )}

                        {authors.length > 0 && (
                            <SearchableFilterPopover
                                label="Autor"
                                searchPlaceholder="Buscar autor..."
                                items={authors}
                                selectedValue={selectedAuthor}
                                onSelect={onSelectAuthor}
                                columns={1}
                            />
                        )}

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={onClearAll}
                                className="text-forest ml-1 cursor-pointer text-xs font-semibold hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilterChips;
