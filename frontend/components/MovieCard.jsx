import { memo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Play, Star } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './ui/Badge';
import { moviePath } from '@/constants/routes';

/**
 * Movie card with poster, hover overlay, rating, and progress bar.
 * Memoized to prevent unnecessary re-renders in lists.
 */
export const MovieCard = memo(function MovieCard({ movie, size = 'md' }) {
  const sizeMap = {
    sm: { w: 'w-40', h: 'h-60' },
    md: { w: 'w-52', h: 'h-80' },
    lg: { w: 'w-64', h: 'h-96' },
  };
  const { w, h } = sizeMap[size] || sizeMap.md;
  const movieId = movie._id || movie.id;
  const posterSrc = movie.poster?.url || movie.poster;

  return (
    <Link to={moviePath(movieId)} className="block shrink-0" id={`movie-card-${movieId}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={`relative ${w} ${h} rounded-2xl overflow-hidden group cursor-pointer`}
        style={{
          boxShadow: '0 15px 40px -15px color-mix(in srgb, var(--cw-text) 50%, transparent)',
        }}
      >
        <ImageWithFallback
          src={posterSrc}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-80 group-hover:opacity-95 transition-opacity"
          style={{
            background: 'linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--cw-text) 90%, black) 100%)',
          }}
        />

        {/* Smart label badge */}
        {movie.smartLabel && (
          <div className="absolute top-3 left-3">
            <Badge variant="accent">{movie.smartLabel}</Badge>
          </div>
        )}

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
            style={{
              background: 'var(--cw-button)',
              boxShadow: '0 0 30px var(--cw-button)',
            }}
          >
            <Play size={22} fill="white" color="white" />
          </div>
        </div>

        {/* Card info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--cw-accent)' }}>
            <Star size={12} fill="currentColor" />
            <span className="text-xs">{movie.rating}</span>
            <span className="text-xs opacity-70" style={{ color: '#FFE7D6' }}>· {movie.year}</span>
          </div>
          <div className="font-medium" style={{ color: '#FFF6EC' }}>{movie.title}</div>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {movie.genres.slice(0, 2).map((g) => (
              <Badge key={g} variant="glass">{g}</Badge>
            ))}
          </div>
          {movie.progress != null && (
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <div className="h-full rounded-full" style={{ width: `${movie.progress}%`, background: 'var(--cw-button)' }} />
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
});
