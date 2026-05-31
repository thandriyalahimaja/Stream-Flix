import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import userService from '@/services/userService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WatchlistContext = createContext(null);

/**
 * Watchlist state management synchronized with the MERN backend.
 */
export function WatchlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await userService.getWatchlist();
      setItems(res.data || []);
    } catch {
      // Quiet fail if watchlist fetch is unsuccessful
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch watchlist whenever authentication state changes
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const add = useCallback(
    async (movieId, movieTitle) => {
      try {
        await userService.addToWatchlist(movieId);
        toast.success(`"${movieTitle || 'Film'}" added to watchlist`);
        // Refresh watchlist from backend to get populated movie info
        await fetchWatchlist();
      } catch (err) {
        toast.error(err.message || 'Failed to add to watchlist');
      }
    },
    [fetchWatchlist, toast]
  );

  const remove = useCallback(
    async (movieId, movieTitle) => {
      try {
        await userService.removeFromWatchlist(movieId);
        let displayTitle = movieTitle;
        if (!displayTitle) {
          const item = items.find((i) => {
            const id = i.movie?._id || i.movie;
            return id === movieId;
          });
          displayTitle = item?.movie?.title || 'Film';
        }
        toast.success(`"${displayTitle}" removed from watchlist`);
        // Update local state to immediately reflect removal
        setItems((prev) => prev.filter((item) => {
          const id = item.movie?._id || item.movie;
          return id !== movieId;
        }));
      } catch (err) {
        toast.error(err.message || 'Failed to remove from watchlist');
      }
    },
    [items, toast]
  );

  const toggle = useCallback(
    async (movieId, movieTitle) => {
      const item = items.find((i) => {
        const id = i.movie?._id || i.movie;
        return id === movieId;
      });
      const isExist = !!item;
      const displayTitle = movieTitle || item?.movie?.title || 'Film';
      if (isExist) {
        await remove(movieId, displayTitle);
      } else {
        await add(movieId, displayTitle);
      }
    },
    [items, add, remove]
  );

  const isInWatchlist = useCallback(
    (movieId) => {
      return items.some((item) => {
        const id = item.movie?._id || item.movie;
        return id === movieId;
      });
    },
    [items]
  );


  const value = useMemo(
    () => ({
      items,
      count: items.length,
      loading,
      add,
      remove,
      toggle,
      isInWatchlist,
      refresh: fetchWatchlist,
    }),
    [items, loading, add, remove, toggle, isInWatchlist, fetchWatchlist]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
}
