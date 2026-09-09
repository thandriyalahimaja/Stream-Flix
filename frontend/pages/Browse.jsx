import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieCard } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { ALL_GENRES, ALL_INDUSTRIES } from '@/constants/genres';
import movieService from '@/services/movieService';
import ErrorState from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { Film, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Globe, SlidersHorizontal } from 'lucide-react';

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function Browse() {
  const [moviesList, setMoviesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [industry, setIndustry] = useState('All');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('rating'); // 'rating' | 'latest' | 'popular'

  // Server-side Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);
  const limit = 24;

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sort,
      };
      if (industry !== 'All') params.industry = industry;
      if (genre !== 'All') params.genre = genre;

      const res = await movieService.getAll(params);
      if (res.success && res.data) {
        setMoviesList(res.data);
        setTotalPages(res.pages || 1);
        setTotalMovies(res.total ?? res.data.length);
      } else {
        throw new Error('Failed to retrieve catalog movies.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading Browse catalog.');
    } finally {
      setLoading(false);
    }
  }, [page, industry, genre, sort]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleIndustryChange = (newIndustry) => {
    setIndustry(newIndustry);
    setPage(1);
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-bold" style={{ color: 'var(--cw-text)', fontSize: 'clamp(32px, 5vw, 48px)' }}>
            Explore Indian & World Cinema
          </h1>
          <p style={{ color: 'var(--cw-text2)' }} className="mt-2 text-sm md:text-base max-w-2xl">
            Explore 800+ films across Tollywood, Bollywood, Kollywood, Mollywood, and Sandalwood. Filter by industry, genre, or rating.
          </p>
        </motion.div>

        {/* Industry / Regional Cinema Filter Tabs */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cw-accent)' }}>
            <Globe size={14} />
            <span>Regional Cinema & Language</span>
          </div>
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--cw-card)' }}>
            {ALL_INDUSTRIES.map((ind) => {
              const isSelected = industry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => handleIndustryChange(ind.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    background: isSelected ? 'var(--cw-button)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--cw-text)',
                    boxShadow: isSelected ? '0 4px 15px -3px var(--cw-button)' : 'none',
                  }}
                >
                  {ind.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre Filters & Sort Bar */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Genre Pills */}
          <div className="flex flex-wrap gap-1.5 flex-1 items-center">
            {ALL_GENRES.map((g) => {
              const isSelected = genre === g;
              return (
                <motion.button
                  key={g}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenreChange(g)}
                  className="px-3.5 py-1.5 rounded-full transition-all text-xs md:text-sm font-medium"
                  style={{
                    background: isSelected ? 'var(--cw-button)' : 'var(--cw-card)',
                    color: isSelected ? 'white' : 'var(--cw-text)',
                    border: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)',
                  }}
                >
                  {g}
                </motion.button>
              );
            })}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold mr-1" style={{ color: 'var(--cw-text2)' }}>
              <SlidersHorizontal size={13} />
              <span>Sort:</span>
            </div>
            {[
              { id: 'rating', label: 'Top Rated' },
              { id: 'latest', label: 'Latest' },
              { id: 'popular', label: 'Most Viewed' },
            ].map((s) => {
              const isSelected = sort === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSortChange(s.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    background: isSelected ? 'var(--cw-accent)' : 'var(--cw-card)',
                    color: isSelected ? 'var(--cw-bg)' : 'var(--cw-text)',
                    border: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter & Count Banner */}
        <div className="mt-6 flex items-center justify-between text-xs font-medium border-b pb-3" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)', color: 'var(--cw-text2)' }}>
          <div>
            Showing <span className="font-semibold" style={{ color: 'var(--cw-text)' }}>{totalMovies > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, totalMovies)}</span> of <span className="font-semibold" style={{ color: 'var(--cw-text)' }}>{totalMovies}</span> films
            {industry !== 'All' && <span> in <span className="text-amber-400 font-semibold">{industry}</span></span>}
            {genre !== 'All' && <span> · <span className="text-amber-400 font-semibold">{genre}</span></span>}
          </div>
          <div>
            Page <span className="font-semibold" style={{ color: 'var(--cw-text)' }}>{page}</span> of <span className="font-semibold" style={{ color: 'var(--cw-text)' }}>{totalPages}</span>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="mt-10">
            <ErrorState error={error} onRetry={fetchMovies} />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex justify-center animate-pulse">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        ) : moviesList.length === 0 ? (
          <EmptyState
            icon={<Film size={40} />}
            title="No movies found"
            description="No films match your selected industry or genre filters. Try changing filters."
          />
        ) : (
          <>
            {/* Movie Grid */}
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
              {moviesList.map((m, i) => {
                const movieId = m._id || m.id;
                return (
                  <motion.div
                    key={movieId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex justify-center"
                  >
                    <MovieCard movie={m} />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}>
                <div className="text-xs font-medium" style={{ color: 'var(--cw-text2)' }}>
                  Showing page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span> ({totalMovies} total films)
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className="p-2 rounded-xl text-xs font-medium transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                    style={{ background: 'var(--cw-card)', color: 'var(--cw-text)' }}
                    title="First page"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                    style={{ background: 'var(--cw-card)', color: 'var(--cw-text)' }}
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  {getPageNumbers(page, totalPages).map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 py-1 text-xs opacity-50" style={{ color: 'var(--cw-text2)' }}>
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className="w-9 h-9 rounded-xl text-xs font-semibold transition cursor-pointer"
                        style={{
                          background: isCurrent ? 'var(--cw-button)' : 'var(--cw-card)',
                          color: isCurrent ? 'white' : 'var(--cw-text)',
                          border: isCurrent ? 'none' : '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)',
                          boxShadow: isCurrent ? '0 4px 12px -2px var(--cw-button)' : 'none',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                    style={{ background: 'var(--cw-card)', color: 'var(--cw-text)' }}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl text-xs font-medium transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                    style={{ background: 'var(--cw-card)', color: 'var(--cw-text)' }}
                    title="Last page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

