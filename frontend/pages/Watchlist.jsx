import { motion } from 'motion/react';
import { Bookmark, X } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieCard } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useWatchlist } from '@/context/WatchlistContext';


export default function Watchlist() {
  const { items, remove, loading } = useWatchlist();
  
  // items contains populated watchlist entries: { _id, movie: { _id, title, poster, rating, year, genres... } }
  const list = items.map((item) => item.movie).filter(Boolean);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-bold" style={{ color: 'var(--cw-text)', fontSize: 'clamp(32px, 5vw, 48px)' }}>
            Your Watchlist
          </h1>
          <p style={{ color: 'var(--cw-text2)' }} className="mt-2 text-sm">
            {list.length} films saved for later · curated by you, kept by us.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-center">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {list.map((m, i) => {
              const movieId = m._id || m.id;
              return (
                <motion.div
                  key={movieId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex justify-center group"
                >
                  <MovieCard movie={m} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(movieId);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
                    style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
                    aria-label="Remove from watchlist"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Bookmark size={64} />}
            title="Your watchlist is empty"
            description="Browse our collection and save films you want to watch later."
            actionLabel="Browse Films"
            actionTo="/browse"
          />
        )}
      </div>
    </MainLayout>
  );
}
