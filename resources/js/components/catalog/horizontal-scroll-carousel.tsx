import React, { useRef } from 'react';

interface HorizontalScrollCarouselProps {
    children: React.ReactNode;
    className?: string;
}

export function HorizontalScrollCarousel({ children, className = '' }: HorizontalScrollCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className={`group/carousel relative ${className}`}>
            <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Ver elementos anteriores"
                className="bg-paper text-ink hover:bg-forest hover:border-forest absolute top-1/2 -left-3 z-30 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-stone-300 opacity-0 shadow-md transition-all duration-200 group-hover/carousel:opacity-100 hover:text-white"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div
                ref={scrollRef}
                className="-my-3 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth py-3 [-ms-overflow-style:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
            >
                {children}
            </div>

            <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Ver elementos siguientes"
                className="bg-paper text-ink hover:bg-forest hover:border-forest absolute top-1/2 -right-3 z-30 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-stone-300 opacity-0 shadow-md transition-all duration-200 group-hover/carousel:opacity-100 hover:text-white"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

export default HorizontalScrollCarousel;
