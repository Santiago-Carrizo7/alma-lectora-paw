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
  const isAllSelected = !selectedGenre && !selectedBadge;

  const badges = [
    { id: 'Novedad', label: '✨ Novedades' },
    { id: 'Más vendido', label: '🔥 Más vendidos' },
    { id: 'Destacado', label: '⭐ Destacados' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-2">
      {/* Botón Todos */}
      <button
        type="button"
        onClick={onClearAll}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          isAllSelected
            ? 'bg-forest border-forest text-stone-100 shadow-xs'
            : 'bg-paper border-stone-300 text-stone-600 hover:border-forest/40 hover:text-forest'
        }`}
      >
        <span>Todos los libros</span>
      </button>

      {/* Badges especiales */}
      {badges.map((b) => {
        const isSelected = selectedBadge?.toLowerCase() === b.id.toLowerCase();
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectBadge(isSelected ? undefined : b.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? 'bg-amber border-amber text-stone-100 shadow-xs'
                : 'bg-paper border-stone-300 text-stone-600 hover:border-amber/40 hover:text-amber'
            }`}
          >
            <span>{b.label}</span>
            {isSelected && <span className="text-[10px] font-bold">✕</span>}
          </button>
        );
      })}

      {/* Separador vertical si hay géneros */}
      {genres.length > 0 && <span className="h-4 w-px bg-stone-300 mx-1 hidden sm:inline-block" />}

      {/* Géneros dinámicos */}
      {genres.map((genre) => {
        const isSelected = selectedGenre?.toLowerCase() === genre.toLowerCase();
        return (
          <button
            key={genre}
            type="button"
            onClick={() => onSelectGenre(isSelected ? undefined : genre)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? 'bg-forest border-forest text-stone-100 shadow-xs'
                : 'bg-paper border-stone-300 text-stone-600 hover:border-forest/40 hover:text-forest'
            }`}
          >
            <span>{toTitleCase(genre)}</span>
            {isSelected && <span className="text-[10px] font-bold">✕</span>}
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
