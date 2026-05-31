import { memo, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

/**
 * Horizontally scrollable row of movie cards with navigation arrows.
 * Memoized to prevent re-renders when parent updates.
 */
export const MovieRow = memo(function MovieRow({ title, movies, hint }) {
  const ref = useRef(null);

  const scroll = useCallback((dir) => {
    ref.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  }, []);

  if (!movies?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-end justify-between mb-4 px-6">
        <div>
          <h2 style={{ color: 'var(--cw-text)' }}>{title}</h2>
          {hint && <p className="text-xs mt-0.5" style={{ color: 'var(--cw-text2)' }}>{hint}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: 'var(--cw-card)', color: 'var(--cw-text)' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: 'var(--cw-card)', color: 'var(--cw-text)' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto px-6 pb-6 hide-scrollbar"
      >
        {movies.map((m, i) => {
          const movieId = m._id || m.id;
          return (
            <motion.div
              key={movieId}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <MovieCard movie={m} />
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
});
