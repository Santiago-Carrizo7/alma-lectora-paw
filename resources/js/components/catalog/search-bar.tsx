import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Buscar por título, autor o palabra clave...',
}: SearchBarProps) {
  const [localVal, setLocalVal] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onChange(localVal);
    }, 350);

    return () => clearTimeout(handler);
  }, [localVal, onChange]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-stone-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar libros por título o autor"
        className="block w-full pl-11 pr-10 py-2.5 border border-stone-300 rounded-lg bg-surface text-ink font-sans placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all duration-200 shadow-2xs text-sm"
      />
      {localVal && (
        <button
          type="button"
          onClick={() => {
            setLocalVal('');
            onChange('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-ink transition-colors cursor-pointer"
          aria-label="Limpiar búsqueda"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
