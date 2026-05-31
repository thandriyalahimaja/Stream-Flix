import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

/**
 * Protected route wrapper — redirects to login if not authenticated.
 */
export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cw-bg)' }}>
        <div className="animate-pulse-soft text-lg" style={{ color: 'var(--cw-text2)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
