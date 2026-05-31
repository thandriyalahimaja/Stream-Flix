import { cn } from '@/utils/cn';

/**
 * Animated skeleton loading placeholder.
 */
export function Skeleton({ className, rounded = 'rounded-xl', ...props }) {
  return (
    <div
      className={cn('animate-shimmer', rounded, className)}
      {...props}
    />
  );
}

/**
 * Card-shaped skeleton for movie cards.
 */
export function MovieCardSkeleton() {
  return (
    <div className="w-52 space-y-3">
      <Skeleton className="w-52 h-80 rounded-2xl" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </div>
  );
}

/**
 * Row of skeleton cards.
 */
export function MovieRowSkeleton({ count = 5 }) {
  return (
    <div className="mb-12">
      <div className="px-6 mb-4">
        <Skeleton className="h-6 w-64 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md mt-2" />
      </div>
      <div className="flex gap-5 px-6 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
