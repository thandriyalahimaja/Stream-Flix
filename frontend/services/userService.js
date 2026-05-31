/**
 * User API service
 */
import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getWatchlist: () => api.get('/watchlist'),
  addToWatchlist: (movieId) => api.post('/watchlist', { movieId }),
  removeFromWatchlist: (movieId) => api.delete(`/watchlist/${movieId}`),
  getWatchHistory: () => api.get('/users/history'),
  addToWatchHistory: (data) => api.post('/users/history', data), // data: { movieId, progress, duration }
  toggleLike: (movieId) => api.post(`/users/like/${movieId}`),
  toggleDislike: (movieId) => api.post(`/users/dislike/${movieId}`),
  getDashboardStats: () => api.get('/users/dashboard'),
};

export default userService;
