export function BookCardSkeleton() {
    return (
        <div className="bg-paper-dark/40 rounded-card border-paper-dark flex h-full animate-pulse flex-col overflow-hidden border">
            {/* Cover Skeleton */}
            <div className="aspect-3/4 w-full bg-stone-300/50" />

            {/* Content Skeleton */}
            <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                <div className="space-y-2">
                    <div className="h-4 w-5/6 rounded bg-stone-300/70" />
                    <div className="h-3 w-1/2 rounded bg-stone-200/70" />
                </div>
                <div className="flex items-center justify-between pt-2">
                    <div className="bg-amber/30 h-5 w-1/3 rounded" />
                    <div className="h-7 w-16 rounded-md bg-stone-300/70" />
                </div>
            </div>
        </div>
    );
}

export default BookCardSkeleton;
