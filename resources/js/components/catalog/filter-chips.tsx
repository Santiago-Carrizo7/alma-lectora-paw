import { useState } from 'react';
import { Drawer } from '../ui/drawer';
import { toTitleCase } from '../../lib/string-utils';

interface FilterChipsProps {
    genres: string[];
    selectedGenre?: string;
    selectedBadge?: string;
    onSelectGenre: (genre: string | undefined) => void;
    onSelectBadge: (badge: string | undefined) => void;
    onClearAll: () => void;
}

export function FilterChips({
    genres = [],
    selectedGenre,
    selectedBadge,
    onSelectGenre,
    onSelectBadge,
    onClearAll,
}: FilterChipsProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isAllSelected = !selectedGenre && !selectedBadge;
    const activeCount = (selectedGenre ? 1 : 0) + (selectedBadge ? 1 : 0);
    const hasActiveFilters = activeCount > 0;

    const badges = [
        { id: 'Novedad', label: '✨ Novedades' },
        { id: 'Más vendido', label: '🔥 Más vendidos' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full flex-col items-center gap-3 px-4 sm:hidden">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide shadow-xs transition-all duration-200 ${
                            hasActiveFilters
                                ? 'bg-forest border-forest text-stone-100'
                                : 'bg-paper text-ink border-stone-300 hover:border-forest/40'
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
                        <span>Filtrar categorías</span>
                        {activeCount > 0 && (
                            <span className="bg-white/25 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white">
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
                    </div>
                )}

                <Drawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title="Filtrar Libros"
                >
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
                            <h4 className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                                Destacados
                            </h4>
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
                                                <span className="bg-white/25 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {genres.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                                    Géneros Literarios
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((genre) => {
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
                                                    <span className="bg-white/25 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
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

            <div className="hidden flex-wrap items-center justify-center gap-2 px-2 sm:flex">
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
                                <span className="bg-white/20 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold">
                                    ✓
                                </span>
                            )}
                        </button>
                    );
                })}

                {genres.length > 0 && <span className="mx-1 hidden h-4 w-px bg-stone-300 sm:inline-block" />}

                {genres.map((genre) => {
                    const isSelected = selectedGenre?.toLowerCase() === genre.toLowerCase();
                    return (
                        <button
                            key={genre}
                            type="button"
                            onClick={() => onSelectGenre(isSelected ? undefined : genre)}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                                isSelected
                                    ? 'bg-forest border-forest text-stone-100 shadow-xs'
                                    : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-600'
                            }`}
                        >
                            <span>{toTitleCase(genre)}</span>
                            {isSelected && (
                                <span className="bg-white/20 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold">
                                    ✓
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default FilterChips;
