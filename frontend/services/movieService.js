/**
 * Movie API service
 */
import api from './api';
import { normalizeMovieResponse } from '@/utils/movieNormalizer';

const movieService = {
  getAll: (params) => api.get('/movies', { params }).then(normalizeMovieResponse),
  getById: (id) => api.get(`/movies/${id}`).then(normalizeMovieResponse),
  search: (query, filters) => api.get('/movies/search', { params: { q: query, ...filters } }).then(normalizeMovieResponse),
  getByGenre: (genre, params) => api.get('/movies/genre', { params: { genre, ...params } }).then(normalizeMovieResponse),
  getTrending: () => api.get('/movies/trending').then(normalizeMovieResponse),
  getRecommended: () => api.get('/movies/recommended').then(normalizeMovieResponse),
  create: (data) => api.post('/movies', data).then(normalizeMovieResponse),
  update: (id, data) => api.put(`/movies/${id}`, data).then(normalizeMovieResponse),
  delete: (id) => api.delete(`/movies/${id}`),
};

export default movieService;
