import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '@/services/authService';
import { setAccessToken } from '@/services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

/**
 * Auth provider managing user state, JWT tokens, and auth operations.
 * Communicates with backend using refresh tokens / httpOnly cookies.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.refreshToken();
        if (res?.accessToken) {
          setAccessToken(res.accessToken);
          const me = await authService.getMe();
          setUser(me.user);
        }
      } catch (err) {
        // Silent fail — no active session found, user stays logged out
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Listen for global logout events (from api interceptor)
  useEffect(() => {
    const handleLogout = () => {
      setUser((currentUser) => {
        if (currentUser) {
          // Delay alert slightly to avoid blocking the render thread
          setTimeout(() => {
            toast.error('Session expired. Please login again.');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 10);
        }
        return null;
      });
      setAccessToken(null);
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [toast]);


  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      setAccessToken(res.accessToken);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setAccessToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, genres = []) => {
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password, genres });
      setAccessToken(res.accessToken);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setAccessToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
      // Logout API call failure is non-critical — local state is cleared regardless
    } finally {
      setAccessToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback((updatedUser) => {
    setUser((prev) => {
      if (!prev) return null;
      // Preserve stats if they aren't returned by profile update
      return {
        ...prev,
        ...updatedUser,
        stats: updatedUser.stats || prev.stats,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUserProfile,
    }),
    [user, loading, login, register, logout, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
