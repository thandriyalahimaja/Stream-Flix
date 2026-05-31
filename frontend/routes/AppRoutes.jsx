import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Browse = lazy(() => import('@/pages/Browse'));
const MovieDetails = lazy(() => import('@/pages/MovieDetails'));
const Search = lazy(() => import('@/pages/Search'));
const Watchlist = lazy(() => import('@/pages/Watchlist'));
const Profile = lazy(() => import('@/pages/Profile'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));


/**
 * Loading fallback for Suspense boundaries.
 */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cw-bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-soft"
          style={{ background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' }}
        >
          <span style={{ color: 'white' }}>◐</span>
        </div>
        <span className="text-sm" style={{ color: 'var(--cw-text2)' }}>Loading...</span>
      </div>
    </div>
  );
}

/**
 * Centralized route configuration with lazy loading.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        
        <Route path={ROUTES.LOGIN} element={
          <ProtectedRoute guestOnly>
            <Login />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.REGISTER} element={
          <ProtectedRoute guestOnly>
            <Register />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.BROWSE} element={<Browse />} />
        <Route path={ROUTES.MOVIE_DETAILS} element={<MovieDetails />} />
        <Route path={ROUTES.SEARCH} element={<Search />} />
        
        <Route path={ROUTES.WATCHLIST} element={
          <ProtectedRoute>
            <Watchlist />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.PROFILE} element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.DASHBOARD} element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.ADMIN} element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
