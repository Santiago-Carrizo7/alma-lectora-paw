import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value = '', onChange, placeholder = 'Buscar por título, autor o palabra clave...' }: SearchBarProps) {
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
        <div className="relative mx-auto w-full max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value)}
                placeholder={placeholder}
                aria-label="Buscar libros por título o autor"
                className="bg-surface text-ink focus:ring-forest/40 focus:border-forest block w-full rounded-lg border border-stone-300 py-2.5 pr-10 pl-11 font-sans text-sm placeholder-stone-400 shadow-2xs transition-all duration-200 focus:ring-2 focus:outline-none"
            />
            {localVal && (
                <button
                    type="button"
                    onClick={() => {
                        setLocalVal('');
                        onChange('');
                    }}
                    className="hover:text-ink absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-stone-400 transition-colors"
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
