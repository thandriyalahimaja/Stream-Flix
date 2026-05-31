/**
 * Movie API service
 */
import api from './api';

const movieService = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  search: (query, filters) => api.get('/movies/search', { params: { q: query, ...filters } }),
  getByGenre: (genre, params) => api.get('/movies/genre', { params: { genre, ...params } }),
  getTrending: () => api.get('/movies/trending'),
  getRecommended: () => api.get('/movies/recommended'),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
};

export default movieService;
