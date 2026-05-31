import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

/**
 * Route protector supporting guest-only, user-only, and admin-only route conditions.
 */
export function ProtectedRoute({ children, adminOnly = false, guestOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cw-bg)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' }}
        >
          <span className="text-white">◐</span>
        </div>
      </div>
    );
  }

  if (guestOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
