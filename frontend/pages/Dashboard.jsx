import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, XAxis, Tooltip } from 'recharts';
import { MainLayout } from '@/layouts/MainLayout';
import { MovieRow } from '@/components/MovieRow';
import { Skeleton, MovieRowSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/userService';
import movieService from '@/services/movieService';
import ErrorState from '@/components/ErrorState';

const chartColors = ['#FF5E5E', '#FFD464', '#E23C64', '#B0183D', '#8A1B42', '#B587C6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch aggregated dashboard statistics
      const statsRes = await userService.getDashboardStats();
      if (statsRes.success) {
        setDashboardData(statsRes.data);
      } else {
        throw new Error('Failed to retrieve statistics');
      }

      // Fetch taste recommendations
      const recRes = await movieService.getRecommended();
      if (recRes.success && recRes.data) {
        setRecommended(recRes.data);
      }

      // Fetch watch history to build the "Continue Watching" & "Recently Viewed" rows
      const historyRes = await userService.getWatchHistory();
      if (historyRes.success && historyRes.data) {
        const continueList = historyRes.data
          .filter((h) => h.progress > 0 && h.progress < 100 && h.movie)
          .map((h) => ({
            ...h.movie,
            progress: h.progress,
          }));
        setContinueWatching(continueList);

        const viewedList = historyRes.data
          .filter((h) => h.movie)
          .map((h) => h.movie);
        setRecentlyViewed(viewedList);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (error) {
    return (
      <MainLayout>
        <ErrorState error={error} onRetry={fetchDashboard} />
      </MainLayout>
    );
  }

  const stats = [
    { k: 'Stream Hours', v: `${dashboardData?.totalWatchHours || 0}h`, s: 'total stream time' },
    { k: 'Films Completed', v: dashboardData?.watchHistoryCount || 0, s: 'completed views' },
    { k: 'Avg. Rating Given', v: dashboardData?.avgRating || '0.0', s: 'rating avg' },
    { k: 'Primary Genre', v: dashboardData?.topGenre || 'Sci-Fi', s: 'taste profiling' },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="font-bold" style={{ color: 'var(--cw-text)', fontSize: 'clamp(32px, 5vw, 44px)' }}>
            Your watch story
          </h1>
          <p style={{ color: 'var(--cw-text2)' }} className="mt-1 text-sm">
            Insights tuned from the films you've chosen to live with.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-8 mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-2 h-[280px] rounded-2xl" />
              <Skeleton className="h-[280px] rounded-2xl" />
            </div>
            <div className="mt-8">
              <MovieRowSkeleton count={5} />
            </div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((c, i) => (
                <motion.div
                  key={c.k}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5 border"
                  style={{
                    background: 'var(--cw-card)',
                    borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                  }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>{c.k}</div>
                  <div className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cw-text)' }}>{c.v}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color: 'var(--cw-button)' }}>{c.s}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6 mt-8">
              {/* Line chart */}
              <div className="lg:col-span-2 rounded-2xl p-6 border" style={{ background: 'var(--cw-card)', borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-semibold" style={{ color: 'var(--cw-text)' }}>Weekly watch hours</h3>
                  <span className="text-xs font-medium" style={{ color: 'var(--cw-text2)' }}>Last 7 days (MERN activity)</span>
                </div>
                <div className="h-[220px]">
                  {dashboardData?.weeklyActivity && dashboardData.weeklyActivity.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.weeklyActivity}>
                        <Tooltip contentStyle={{ background: 'var(--cw-bg)', border: 'none', borderRadius: 12, color: 'var(--cw-text)' }} />
                        <XAxis dataKey="d" stroke="var(--cw-text2)" />
                        <Line
                          type="monotone"
                          dataKey="h"
                          stroke="var(--cw-button)"
                          strokeWidth={3}
                          dot={{ fill: 'var(--cw-accent)', r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--cw-text2)' }}>
                      No recent viewing activities.
                    </div>
                  )}
                </div>
              </div>

              {/* Pie chart */}
              <div className="rounded-2xl p-6 border" style={{ background: 'var(--cw-card)', borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--cw-text)' }}>Genre mix</h3>
                <div className="h-[220px]">
                  {dashboardData?.genreMix && dashboardData.genreMix.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.genreMix}
                          dataKey="count"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {dashboardData.genreMix.map((g, i) => (
                            <Cell key={g.name} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--cw-bg)', border: 'none', borderRadius: 12, color: 'var(--cw-text)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--cw-text2)' }}>
                      No data to profile your preferences.
                    </div>
                  )}
                </div>
                {dashboardData?.genreMix && dashboardData.genreMix.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {dashboardData.genreMix.map((g, i) => (
                      <span
                        key={g.name}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'var(--cw-bg)', color: 'var(--cw-text)' }}
                      >
                        <span style={{ color: chartColors[i % chartColors.length] }}>●</span> {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Movie rows */}
            <div className="mt-12 space-y-8">
              {continueWatching.length > 0 && (
                <MovieRow
                  title="Continue Watching"
                  movies={continueWatching}
                  hint="Resume where you paused"
                />
              )}

              {recommended.length > 0 && (
                <MovieRow
                  title="Recommended For You"
                  movies={recommended}
                  hint="Films customized to your taste"
                />
              )}

              {recentlyViewed.length > 0 && (
                <MovieRow
                  title="Recently Viewed"
                  movies={recentlyViewed}
                  hint="Your film streaming history"
                />
              )}

              {user?.likedMovies && user.likedMovies.length > 0 && (
                <MovieRow
                  title="Liked Recently"
                  movies={user.likedMovies}
                  hint="Films you gave a 👍"
                />
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
