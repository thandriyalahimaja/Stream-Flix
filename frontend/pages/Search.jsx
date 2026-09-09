import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search as SearchIcon, TrendingUp, Loader2, Sparkles, Clock, Globe, Film, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieCard } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useDebounce } from '@/hooks/useDebounce';
import movieService from '@/services/movieService';
import aiService from '@/services/aiService';

const trending = ['Spider', 'Dune', 'Family', 'Action', 'Drama'];

const aiSuggestions = [
  'Dark psychological thriller under 2 hours',
  'Something similar to Dangal but from South India',
  'Tamil or Telugu crime thriller with investigation',
  'Emotional family sports drama without violence',
  'Feel-good Malayalam comedy with heart',
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'ai' ? 'ai' : 'standard');

  // Standard search state
  const [q, setQ] = useState(params.get('q') || '');
  const [genre, setGenre] = useState('All');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(q, 300);

  // AI search state
  const [aiQuery, setAiQuery] = useState(params.get('aiQ') || '');
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIntent, setAiIntent] = useState(null);
  const [aiReferenceMovie, setAiReferenceMovie] = useState(null);
  const [aiIsFallback, setAiIsFallback] = useState(false);
  const [aiRelaxationApplied, setAiRelaxationApplied] = useState(false);
  const [aiRelaxedConstraints, setAiRelaxedConstraints] = useState([]);
  const [aiLatency, setAiLatency] = useState(null);

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

  // Perform standard keyword search
  const performStandardSearch = async () => {
    if (mode !== 'standard') return;
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

  useEffect(() => {
    if (mode === 'standard') {
      performStandardSearch();
    }
  }, [debouncedQ, genre, mode]);

  // Standard autocomplete
  useEffect(() => {
    if (mode !== 'standard') return;
    const getSuggestions = async () => {
      if (!q.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await movieService.search(q, { limit: 5 });
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch {}
    };

    getSuggestions();
  }, [q, mode]);

  const selectSuggestion = (title) => {
    setQ(title);
    setParams({ q: title });
    setSuggestions([]);
  };

  // Perform AI Natural Language Discovery
  const handleAISubmit = async (e, queryOverride) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetQuery = (queryOverride || aiQuery).trim();
    if (!targetQuery) return;

    if (queryOverride) {
      setAiQuery(queryOverride);
    }

    setAiLoading(true);
    setError(null);

    try {
      const res = await aiService.searchWithAI(targetQuery, { limit: 12 });
      if (res && res.success) {
        setAiResults(res.data || []);
        setAiIntent(res.normalizedIntent || null);
        setAiReferenceMovie(res.referenceMovie || null);
        setAiIsFallback(Boolean(res.isFallback));
        setAiRelaxationApplied(Boolean(res.relaxationApplied || res.filtersRelaxed));
        setAiRelaxedConstraints(res.relaxedConstraints || []);
        setAiLatency(res.latency || null);
        saveSearch(targetQuery);
      } else {
        throw new Error(res?.message || 'AI discovery service was unable to complete the query.');
      }
    } catch (err) {
      setError(err.message || 'AI discovery service encountered an issue. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError(null);
    if (newMode === 'ai') {
      setParams({ mode: 'ai' });
      if (aiQuery.trim() && aiResults.length === 0) {
        handleAISubmit(null, aiQuery);
      }
    } else {
      setParams({ q: q || '' });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6">
        {/* Mode Switcher */}
        <div className="flex justify-center mb-6">
          <div
            className="flex p-1 rounded-2xl border backdrop-blur-md"
            style={{
              background: 'var(--cw-card)',
              borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
            }}
          >
            <button
              onClick={() => handleModeSwitch('standard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={{
                background: mode === 'standard' ? 'var(--cw-button)' : 'transparent',
                color: mode === 'standard' ? 'white' : 'var(--cw-text2)',
              }}
            >
              <SearchIcon size={16} /> Standard Search
            </button>
            <button
              onClick={() => handleModeSwitch('ai')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={{
                background: mode === 'ai' ? 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' : 'transparent',
                color: mode === 'ai' ? 'white' : 'var(--cw-text2)',
              }}
            >
              <Sparkles size={16} /> Ask StreamFlix AI
            </button>
          </div>
        </div>

        {/* ─── STANDARD SEARCH UI ─── */}
        {mode === 'standard' && (
          <>
            {/* Search bar */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative">
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
                          className="w-full text-left px-6 py-3 hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer"
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
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer"
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
                <ErrorState error={error} onRetry={performStandardSearch} />
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
              />
            ) : null}
          </>
        )}

        {/* ─── ASK STREAMFLIX AI UI ─── */}
        {mode === 'ai' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2" style={{ color: 'var(--cw-text)' }}>
                <Sparkles size={24} style={{ color: 'var(--cw-button)' }} /> What do you want to watch?
              </h1>
              <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--cw-text2)' }}>
                Describe any mood, theme, language, runtime, or reference movie in plain English.
                StreamFlix AI retrieves and ranks the most relevant films locally.
              </p>
            </div>

            {/* AI Search input form */}
            <form onSubmit={handleAISubmit} className="relative mb-6">
              <div
                className="flex items-center gap-3 px-6 py-4 rounded-3xl border"
                style={{
                  background: 'var(--cw-card)',
                  borderColor: 'color-mix(in srgb, var(--cw-text) 12%, transparent)',
                  boxShadow: '0 20px 60px -20px color-mix(in srgb, var(--cw-button) 20%, transparent)',
                }}
              >
                <Sparkles size={22} className="shrink-0" style={{ color: 'var(--cw-button)' }} />
                <input
                  autoFocus
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. 'dark psychological thriller under 2 hours' or 'something like Dangal from South India'…"
                  className="flex-1 bg-transparent outline-none text-base md:text-lg"
                  style={{ color: 'var(--cw-text)' }}
                  id="ai-search-input"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-5 py-2 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))',
                    color: 'white',
                  }}
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>Find Movies</span>
                </button>
              </div>
            </form>

            {/* Inspiration Prompt Chips */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--cw-text2)' }}>
                <span>Try these prompts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleAISubmit(null, suggestion)}
                    className="text-xs font-semibold px-3.5 py-2 rounded-full border transition-all hover:scale-105 cursor-pointer text-left"
                    style={{
                      background: 'var(--cw-card)',
                      color: 'var(--cw-text)',
                      borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                    }}
                  >
                    ✨ {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {aiLoading && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--cw-button)' }} />
                  <span className="text-base font-bold" style={{ color: 'var(--cw-text)' }}>
                    Extracting intent & ranking catalog...
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-center">
                      <MovieCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !aiLoading && (
              <div className="mt-8">
                <ErrorState error={error} onRetry={() => handleAISubmit(null, aiQuery)} />
              </div>
            )}

            {/* Results Display */}
            {!aiLoading && !error && aiResults.length > 0 && (
              <div className="mt-6">
                {/* AI Understood Badge Section */}
                {aiIntent && (
                  <div
                    className="p-5 rounded-2xl border mb-8"
                    style={{
                      background: 'color-mix(in srgb, var(--cw-card) 70%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cw-button)' }}>
                        <CheckCircle2 size={16} /> AI Understood Your Request
                      </div>
                      {aiIsFallback && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Offline Discovery Mode
                        </span>
                      )}
                      {aiRelaxationApplied && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20" title={`Relaxed: ${aiRelaxedConstraints.join(', ')}`}>
                          Filters Relaxed ({aiRelaxedConstraints.length > 0 ? aiRelaxedConstraints.join(', ') : 'broader match'})
                        </span>
                      )}
                      {aiLatency && (
                        <span className="text-xs" style={{ color: 'var(--cw-text2)' }}>
                          Retrieval: {aiLatency.totalLatencyMs}ms (AI: {aiLatency.aiLatencyMs}ms)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {aiIntent.genres?.map(g => (
                        <span key={g} className="px-3 py-1 rounded-full text-xs font-bold border" style={{ background: 'color-mix(in srgb, var(--cw-button) 15%, transparent)', color: 'var(--cw-button)', borderColor: 'var(--cw-button)' }}>
                          🎭 {g}
                        </span>
                      ))}
                      {aiIntent.moods?.map(m => (
                        <span key={m} className="px-3 py-1 rounded-full text-xs font-bold border" style={{ background: 'color-mix(in srgb, var(--cw-accent) 15%, transparent)', color: 'var(--cw-accent)', borderColor: 'var(--cw-accent)' }}>
                          🌙 {m}
                        </span>
                      ))}
                      {aiIntent.themes?.map(t => (
                        <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ background: 'var(--cw-card)', color: 'var(--cw-text)', borderColor: 'color-mix(in srgb, var(--cw-text) 12%, transparent)' }}>
                          🧠 {t}
                        </span>
                      ))}
                      {aiIntent.runtimeMaxMinutes && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'var(--cw-card)', color: 'var(--cw-text)', borderColor: 'color-mix(in srgb, var(--cw-text) 12%, transparent)' }}>
                          <Clock size={12} /> Under {aiIntent.runtimeMaxMinutes} min
                        </span>
                      )}
                      {aiIntent.languages?.map(l => (
                        <span key={l} className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 uppercase" style={{ background: 'var(--cw-card)', color: 'var(--cw-text)', borderColor: 'color-mix(in srgb, var(--cw-text) 12%, transparent)' }}>
                          <Globe size={12} /> {l}
                        </span>
                      ))}
                      {Array.isArray(aiIntent.referenceMovies) && aiIntent.referenceMovies.length > 0 ? (
                        aiIntent.referenceMovies.map(refTitle => (
                          <span key={refTitle} className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--cw-button) 15%, transparent)', color: 'var(--cw-button)', borderColor: 'var(--cw-button)' }}>
                            <Film size={12} /> Like: {refTitle}
                          </span>
                        ))
                      ) : aiReferenceMovie ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--cw-button) 15%, transparent)', color: 'var(--cw-button)', borderColor: 'var(--cw-button)' }}>
                          <Film size={12} /> Like: {aiReferenceMovie.title}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Section Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--cw-text)' }}>
                    Recommended For You ({aiResults.length} films)
                  </h2>
                  <span className="text-xs font-semibold" style={{ color: 'var(--cw-text2)' }}>
                    Ranked via Hybrid Semantic + MMR Diversity
                  </span>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {aiResults.map((m) => {
                    const movieId = m._id || m.id;
                    return (
                      <div key={movieId} className="flex justify-center">
                        <MovieCard movie={m} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State when no results returned */}
            {!aiLoading && !error && aiResults.length === 0 && aiQuery.trim() && (
              <EmptyState
                title="No films matched this query"
                description={`We couldn't find films strictly matching "${aiQuery}". Try relaxing constraints or describing a different theme.`}
                actionLabel="Try Another Query"
                onAction={() => setAiQuery('')}
              />
            )}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
