import { Link } from '@inertiajs/react';

export interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationLinksProps {
    links: PaginationLinkItem[];
    preserveState?: boolean;
    preserveScroll?: boolean;
    className?: string;
}

export function PaginationLinks({
    links,
    preserveState = true,
    preserveScroll = true,
    className = 'flex flex-wrap items-center gap-1',
}: PaginationLinksProps) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <nav className={className} aria-label="Paginación">
            {links.map((link, idx) => {
                const isPrev = idx === 0 || /previous|anterior/i.test(link.label);
                const isNext = idx === links.length - 1 || /next|siguiente/i.test(link.label);

                const content = isPrev ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                ) : isNext ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                ) : (
                    <span>{link.label}</span>
                );

                const ariaLabel = isPrev ? 'Página anterior' : isNext ? 'Página siguiente' : undefined;

                if (!link.url) {
                    return (
                        <span
                            key={idx}
                            aria-label={ariaLabel}
                            aria-disabled="true"
                            className="inline-flex h-8 min-w-8 cursor-not-allowed items-center justify-center rounded-lg px-2.5 text-xs text-stone-400 opacity-50 select-none"
                        >
                            {content}
                        </span>
                    );
                }

                return (
                    <Link
                        key={idx}
                        href={link.url}
                        preserveState={preserveState}
                        preserveScroll={preserveScroll}
                        aria-label={ariaLabel}
                        aria-current={link.active ? 'page' : undefined}
                        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-colors ${
                            link.active
                                ? 'bg-forest font-bold text-white shadow-2xs'
                                : 'text-ink hover:bg-paper-dark border border-transparent hover:border-paper-dark/60'
                        }`}
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
}
