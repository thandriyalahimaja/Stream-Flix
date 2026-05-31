/**
 * Route path constants — single source of truth for all routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BROWSE: '/browse',
  MOVIE_DETAILS: '/movie/:id',
  SEARCH: '/search',
  WATCHLIST: '/watchlist',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
};

/**
 * Build movie detail path
 */
export function moviePath(id) {
  return `/movie/${id}`;
}
