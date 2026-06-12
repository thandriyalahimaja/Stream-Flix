import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Play, Plus, Check, Info, Sparkles } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieRow } from '@/components/MovieRow';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getGreeting } from '@/utils/formatters';
import { moviePath } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { useToast } from '@/context/ToastContext';
import { Skeleton, MovieRowSkeleton } from '@/components/ui/Skeleton';
import movieService from '@/services/movieService';
import userService from '@/services/userService';
import ErrorState from '@/components/ErrorState';

export default function Home() {
  const { user } = useAuth();
  const { toggle: toggleWatchlistRaw, isInWatchlist } = useWatchlist();
  const toast = useToast();

  const [isWatchlistPending, setIsWatchlistPending] = useState(false);
  const [moviesList, setMoviesList] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = user?.name?.split(' ')[0] || 'cinephile';

  const handleToggleWatchlist = async (movieId, movieTitle) => {
    if (!user) {
      toast.warning('Please sign in to manage your watchlist.');
      return;
    }
    if (isWatchlistPending) return;
    setIsWatchlistPending(true);
    try {
      await toggleWatchlistRaw(movieId, movieTitle);
    } catch {
      // quiet fail
    } finally {
      setIsWatchlistPending(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all movies for hero and generic rows
      const allRes = await movieService.getAll({ limit: 50 });
      if (allRes.success && allRes.data) {
        setMoviesList(allRes.data);
      }

      // 2. Fetch trending movies
      const trendRes = await movieService.getTrending();
      if (trendRes.success && trendRes.data) {
        setTrending(trendRes.data);
      }

      // 3. Fetch recommended movies if authenticated
      if (user) {
        const recRes = await movieService.getRecommended();
        if (recRes.success && recRes.data) {
          setRecommended(recRes.data);
        }
      } else {
        setRecommended([]);
      }

      // 4. Fetch watch history if authenticated
      if (user) {
        const historyRes = await userService.getWatchHistory();
        if (historyRes.success && historyRes.data) {
          const continueList = historyRes.data
            .filter((h) => h.progress > 0 && h.progress < 100 && h.movie)
            .map((h) => ({
              ...h.movie,
              progress: h.progress,
            }));
          setContinueWatching(continueList);
        }
      } else {
        setContinueWatching([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load home screen content.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <MainLayout>
        <ErrorState error={error} onRetry={fetchData} />
      </MainLayout>
    );
  }

  if (loading && moviesList.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <Skeleton className="h-[60vh] rounded-3xl" />
          <MovieRowSkeleton count={5} />
          <MovieRowSkeleton count={5} />
        </div>
      </MainLayout>
    );
  }


  // Pick first movie as hero
  const hero = moviesList[0] || null;

  // Filter movies into specific category arrays
  const sciFiMovies = moviesList.filter((m) => (m.genres || []).includes('Sci-Fi'));
  const dramaMovies = moviesList.filter((m) => (m.genres || []).includes('Drama'));
  const thrillerMovies = moviesList.filter((m) => (m.genres || []).includes('Thriller'));

  return (
    <MainLayout>
      {/* Hero Section */}
      {hero && (
        <section className="relative px-6 pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="relative rounded-3xl overflow-hidden h-[78vh] min-h-[560px] border"
            style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 5%, transparent)' }}
          >
            <ImageWithFallback
              src={hero.backdrop?.url || hero.backdrop}
              alt={hero.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, var(--cw-bg) 0%, color-mix(in srgb, var(--cw-bg) 75%, transparent) 45%, transparent 80%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(0deg, var(--cw-bg) 0%, transparent 45%)',
              }}
            />

            <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end p-6 md:p-10 lg:p-16">
              {/* Hero text */}
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="lg:col-span-7 max-w-2xl"
              >
                <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--cw-button)' }}>
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">{getGreeting()}, {userName} — picked for your night.</span>
                </div>
                <h1
                  className="leading-none"
                  style={{ color: 'var(--cw-text)', fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-0.02em', fontWeight: 700 }}
                >
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-xl text-sm md:text-base leading-relaxed" style={{ color: 'var(--cw-text2)' }}>
                  {hero.synopsis}
                </p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <Link to={moviePath(hero._id || hero.id)}>
                    <Button size="lg" icon={<Play size={18} fill="white" />}>
                      Details
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={isInWatchlist(hero._id) ? <Check size={18} /> : <Plus size={18} />}
                    onClick={() => handleToggleWatchlist(hero._id, hero.title)}
                    disabled={isWatchlistPending}
                  >
                    {isInWatchlist(hero._id) ? 'In Watchlist' : 'Watchlist'}
                  </Button>
                </div>
              </motion.div>

              {/* Hero info card */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="lg:col-span-4 lg:col-start-9 glass-strong rounded-2xl p-6 hidden lg:block border border-white/5"
              >
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>FEATURED · {hero.year}</div>
                <div className="grid grid-cols-3 gap-4 mt-3" style={{ color: 'var(--cw-text)' }}>
                  <div>
                    <div className="text-xl font-semibold">{hero.rating}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--cw-text2)' }}>Rating</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold truncate max-w-[70px]">{hero.duration}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--cw-text2)' }}>Runtime</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">1080p</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--cw-text2)' }}>Quality</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(hero.genres || []).map((g) => (
                    <Badge key={g} variant="primary">{g}</Badge>
                  ))}
                </div>
                <div className="mt-4 text-xs font-medium" style={{ color: 'var(--cw-text2)' }}>
                  Directed by <span className="font-semibold" style={{ color: 'var(--cw-text)' }}>{hero.director}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Movie Rows */}
      {continueWatching.length > 0 && (
        <MovieRow
          title="Continue Watching"
          movies={continueWatching}
          hint="Pick up where you left off"
        />
      )}

      {recommended.length > 0 && (
        <MovieRow
          title="Recommended For You"
          movies={recommended}
          hint="Personalized profiles from your taste preferences"
        />
      )}

      {trending.length > 0 && (
        <MovieRow
          title="Trending Now"
          movies={trending}
          hint="Most watched titles this week"
        />
      )}

      {sciFiMovies.length > 0 && (
        <MovieRow
          title="Mind-Bending Sci-Fi"
          movies={sciFiMovies}
          hint="Theoretical physics and future realities"
        />
      )}

      {dramaMovies.length > 0 && (
        <MovieRow
          title="Emotional Dramas"
          movies={dramaMovies}
          hint="Deep character-driven stories"
        />
      )}

      {thrillerMovies.length > 0 && (
        <MovieRow
          title="High Stakes Thrillers"
          movies={thrillerMovies}
          hint="Keep you on the edge of your seat"
        />
      )}
    </MainLayout>
  );
}
