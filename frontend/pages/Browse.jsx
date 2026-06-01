import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieCard } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { ALL_GENRES } from '@/constants/genres';
import movieService from '@/services/movieService';
import ErrorState from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { Film } from 'lucide-react';

export default function Browse() {
  const [moviesList, setMoviesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('rating');

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getAll({ limit: 100 });
      if (res.success && res.data) {
        setMoviesList(res.data);
      } else {
        throw new Error('Failed to retrieve catalog movies.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading Browse catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filtered = useMemo(() => {
    let list = [...moviesList];
    
    // Filter logic
    if (activeTab === 'Family') {
      list = list.filter((m) => (m.genres || []).includes('Family'));
    } else if (activeTab === 'Sci-Fi') {
      list = list.filter((m) => (m.genres || []).includes('Sci-Fi'));
    } else if (genre !== 'All') {
      list = list.filter((m) => (m.genres || []).includes(genre));
    }

    // Sort logic
    if (activeTab === 'Popular') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (activeTab === 'Latest' || sort === 'year') {
      list.sort((a, b) => b.year - a.year);
    } else if (activeTab === 'Top Rated' || sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [moviesList, activeTab, genre, sort]);


  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-bold" style={{ color: 'var(--cw-text)', fontSize: 'clamp(32px, 5vw, 48px)' }}>
            Browse the wave
          </h1>
          <p style={{ color: 'var(--cw-text2)' }} className="mt-2 text-sm md:text-base">
            Curated collections. Explore by mood, genre, or pure chance.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-8 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--cw-card)' }}>
          {['All', 'Popular', 'Latest', 'Top Rated', 'Family', 'Sci-Fi'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setGenre('All');
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? 'var(--cw-button)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--cw-text)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Genre filters */}
        {activeTab === 'All' && (
          <div className="flex flex-wrap gap-2 mt-6 items-center">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {ALL_GENRES.map((x) => (
                <motion.button
                  key={x}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenre(x)}
                  className="px-4 py-2 rounded-full transition-all text-sm font-medium"
                  style={{
                    background: genre === x ? 'var(--cw-button)' : 'var(--cw-card)',
                    color: genre === x ? 'white' : 'var(--cw-text)',
                    border: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)',
                  }}
                >
                  {x}
                </motion.button>
              ))}
            </div>

            {/* Sort buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              {['rating', 'year'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: sort === s ? 'var(--cw-accent)' : 'var(--cw-card)',
                    color: 'var(--cw-text)',
                    border: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)',
                  }}
                >
                  Sort: {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-10">
            <ErrorState error={error} onRetry={fetchMovies} />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex justify-center animate-pulse">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Film size={40} />}
            title="No movies found"
            description="No films match this category or genre filter. Try a different wave."
          />
        ) : (
          /* Movie grid */
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10">
            {filtered.map((m, i) => {
              const movieId = m._id || m.id;
              return (
                <motion.div
                  key={movieId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex justify-center"
                >
                  <MovieCard movie={m} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
