import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search as SearchIcon, TrendingUp, Loader2 } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieCard } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useDebounce } from '@/hooks/useDebounce';
import movieService from '@/services/movieService';

const trending = ['Spider', 'Dune', 'Family', 'Action', 'Drama'];


export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [genre, setGenre] = useState('All');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(q, 300);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [error, setError] = useState(null);

  const saveSearch = (term) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.search(debouncedQ, { genre });
      if (res.success && res.data) {
        setResults(res.data);
        if (debouncedQ.trim()) {
          saveSearch(debouncedQ);
        }
      } else {
        throw new Error('Failed to retrieve search results');
      }
    } catch (err) {
      setError(err.message || 'Search service encountered a query error.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch search results from the database
  useEffect(() => {
    performSearch();
  }, [debouncedQ, genre]);


  // Fetch suggestions for the autocomplete dropdown
  useEffect(() => {
    const getSuggestions = async () => {
      if (!q.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        // Query search endpoint with a small limit for autocomplete
        const res = await movieService.search(q, { limit: 5 });
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch {
        // Suggestion failures are handled gracefully
      }
    };

    getSuggestions();
  }, [q]);

  const selectSuggestion = (title) => {
    setQ(title);
    setParams({ q: title });
    setSuggestions([]);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6">
        {/* Search bar */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative">
          <div
            className="flex items-center gap-3 px-6 py-5 rounded-3xl border"
            style={{
              background: 'var(--cw-card)',
              borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
              boxShadow: '0 20px 60px -20px color-mix(in srgb, var(--cw-text) 15%, transparent)',
            }}
          >
            {loading ? (
              <Loader2 size={22} className="animate-spin" style={{ color: 'var(--cw-button)' }} />
            ) : (
              <SearchIcon size={22} style={{ color: 'var(--cw-button)' }} />
            )}
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setParams({ q: e.target.value });
              }}
              placeholder="Search by title, director, synopsis, or mood…"
              className="flex-1 bg-transparent outline-none text-lg"
              style={{ color: 'var(--cw-text)' }}
              id="search-input"
            />
          </div>

          {/* Autocomplete suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20 border"
                style={{
                  background: 'var(--cw-card)',
                  borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                  boxShadow: '0 30px 60px -20px color-mix(in srgb, var(--cw-text) 25%, transparent)',
                }}
              >
                {suggestions.map((s) => {
                  const sId = s._id || s.id;
                  return (
                    <button
                      key={sId}
                      onClick={() => selectSuggestion(s.title)}
                      className="w-full text-left px-6 py-3 hover:bg-white/5 flex items-center justify-between transition-colors"
                      style={{ color: 'var(--cw-text)' }}
                    >
                      <span className="font-semibold text-sm">{s.title}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5" style={{ color: 'var(--cw-text2)' }}>
                        {s.genres?.[0] || 'Film'}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recent & Trending searches (when empty) */}
        {!q && (
          <div className="mt-10 grid md:grid-cols-2 gap-8">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>
                    Recent searches
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs underline hover:text-[var(--cw-button)] cursor-pointer"
                    style={{ color: 'var(--cw-text2)' }}
                  >
                    Clear history
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => selectSuggestion(s)}
                      className="px-4 py-2 rounded-full text-sm font-semibold transition-all border hover:scale-105 cursor-pointer"
                      style={{
                        background: 'var(--cw-card)',
                        color: 'var(--cw-text)',
                        borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>
                <TrendingUp size={16} style={{ color: 'var(--cw-button)' }} /> Trending searches
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((t) => (
                  <button
                    key={t}
                    onClick={() => selectSuggestion(t)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all border hover:scale-105 cursor-pointer"
                    style={{
                      background: 'var(--cw-card)',
                      color: 'var(--cw-text)',
                      borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Genre filter chips */}
        <div className="flex flex-wrap gap-2 mt-8">
          {['All', 'Sci-Fi', 'Drama', 'Thriller', 'Romance', 'Mystery', 'Comedy'].map((x) => (
            <button
              key={x}
              onClick={() => setGenre(x)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border"
              style={{
                background: genre === x ? 'var(--cw-button)' : 'transparent',
                color: genre === x ? 'white' : 'var(--cw-text2)',
                borderColor: genre === x ? 'var(--cw-button)' : 'color-mix(in srgb, var(--cw-text) 15%, transparent)',
              }}
            >
              {x}
            </button>
          ))}
        </div>

        {/* Results grid */}
        {error ? (
          <div className="mt-8">
            <ErrorState error={error} onRetry={performSearch} />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-center">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {results.map((m) => {
              const movieId = m._id || m.id;
              return (
                <div key={movieId} className="flex justify-center">
                  <MovieCard movie={m} />
                </div>
              );
            })}
          </div>
        ) : debouncedQ ? (
          <EmptyState
            title="No results found"
            description={`We couldn't find any films matching "${debouncedQ}".`}
            actionLabel="Explore Family Films"
            actionTo="/search?q=Family"
            guidance={
              <div className="mt-4 text-xs" style={{ color: 'var(--cw-text2)' }}>
                Try exploring other popular genres:{' '}
                {['Action', 'Adventure', 'Animation', 'Drama', 'Sci-Fi', 'Mystery', 'Thriller'].map((g) => (
                  <button
                    key={g}
                    onClick={() => selectSuggestion(g)}
                    className="underline mx-1 hover:text-[var(--cw-button)] transition-colors cursor-pointer"
                  >
                    {g}
                  </button>
                ))}
              </div>
            }
          />
        ) : null}
      </div>
    </MainLayout>
  );
}

