/**
 * User API service
 */
import api from './api';
import { normalizeUserResponse } from '@/utils/movieNormalizer';

const userService = {
  getProfile: () => api.get('/users/profile').then(normalizeUserResponse),
  updateProfile: (data) => api.put('/users/profile', data).then(normalizeUserResponse),
  getWatchlist: () => api.get('/watchlist').then(normalizeUserResponse),
  addToWatchlist: (movieId) => api.post('/watchlist', { movieId }),
  removeFromWatchlist: (movieId) => api.delete(`/watchlist/${movieId}`),
  getWatchHistory: () => api.get('/users/history').then(normalizeUserResponse),
  addToWatchHistory: (data) => api.post('/users/history', data), // data: { movieId, progress, duration }
  toggleLike: (movieId) => api.post(`/users/like/${movieId}`),
  toggleDislike: (movieId) => api.post(`/users/dislike/${movieId}`),
  getDashboardStats: () => api.get('/users/dashboard'),
};

export default userService;
