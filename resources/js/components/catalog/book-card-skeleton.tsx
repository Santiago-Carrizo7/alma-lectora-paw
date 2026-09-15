export function BookCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-paper-dark/40 rounded-card overflow-hidden border border-paper-dark animate-pulse">
      {/* Cover Skeleton */}
      <div className="aspect-3/4 w-full bg-stone-300/50" />

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-stone-300/70 rounded w-5/6" />
          <div className="h-3 bg-stone-200/70 rounded w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-amber/30 rounded w-1/3" />
          <div className="h-7 bg-stone-300/70 rounded-md w-16" />
        </div>
      </div>
    </div>
  );
}

export default BookCardSkeleton;
