import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface SearchableFilterPopoverProps {
    label: string;
    searchPlaceholder: string;
    items: string[];
    selectedValue?: string;
    formatItem?: (item: string) => string;
    onSelect: (value: string | undefined) => void;
    columns?: 1 | 2;
    align?: 'center' | 'left';
}

export function SearchableFilterPopover({
    label,
    searchPlaceholder,
    items,
    selectedValue,
    formatItem = (v) => v,
    onSelect,
    columns = 1,
    align = 'center',
}: SearchableFilterPopoverProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => inputRef.current?.focus(), 30);

        const handleOutsideClick = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const filteredItems = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item) => formatItem(item).toLowerCase().includes(normalized));
    }, [items, query, formatItem]);

    const isSelected = Boolean(selectedValue);
    const displayLabel = selectedValue ? formatItem(selectedValue) : label;

    const handleToggleOpen = () => {
        setOpen((prev) => {
            if (prev) setQuery('');
            return !prev;
        });
    };

    const handlePick = (item: string) => {
        const alreadyActive = selectedValue?.toLowerCase() === item.toLowerCase();
        onSelect(alreadyActive ? undefined : item);
        setOpen(false);
        setQuery('');
    };

    return (
        <div ref={containerRef} className="relative inline-block text-left">
            <div className="inline-flex items-center">
                <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    onClick={handleToggleOpen}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                        isSelected
                            ? 'bg-forest border-forest pr-2 text-stone-100 shadow-xs'
                            : 'bg-paper hover:border-forest/40 hover:text-forest border-stone-300 text-stone-700'
                    }`}
                >
                    <span className="max-w-[180px] truncate">{displayLabel}</span>
                    {!isSelected && (
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    )}
                </button>
                {isSelected && (
                    <button
                        type="button"
                        aria-label={`Quitar filtro de ${label.toLowerCase()}`}
                        onClick={() => onSelect(undefined)}
                        className="bg-forest hover:bg-forest-light -ml-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-stone-100/40 text-stone-100 shadow-xs transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {open && (
                <div
                    role="listbox"
                    aria-label={label}
                    className={`bg-paper border-paper-dark absolute z-40 mt-2 overflow-hidden rounded-xl border shadow-lg ${
                        align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2'
                    } ${columns === 2 ? 'w-80 sm:w-[440px]' : 'w-72'}`}
                >
                    <div className="border-paper-dark border-b p-2.5">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="bg-paper-dark/40 focus:border-forest focus:ring-forest/20 w-full rounded-lg border border-stone-300 py-1.5 pr-7 pl-8 text-xs text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    aria-label="Limpiar búsqueda"
                                    onClick={() => setQuery('')}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-stone-400 hover:text-stone-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div
                        className={`max-h-64 overflow-y-auto p-1.5 ${
                            columns === 2 ? 'grid grid-cols-1 gap-0.5 sm:grid-cols-2' : 'space-y-0.5'
                        }`}
                    >
                        {filteredItems.length === 0 ? (
                            <p className="col-span-full py-6 text-center text-xs text-stone-400">Sin coincidencias</p>
                        ) : (
                            filteredItems.map((item) => {
                                const active = selectedValue?.toLowerCase() === item.toLowerCase();
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => handlePick(item)}
                                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                                            active
                                                ? 'bg-forest/10 text-forest font-semibold'
                                                : 'text-stone-700 hover:bg-stone-100'
                                        }`}
                                    >
                                        <span className="truncate">{formatItem(item)}</span>
                                        {active && <Check className="text-forest h-3.5 w-3.5 shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
export default SearchableFilterPopover;
