/**
 * Movie API service with client-side in-memory caching for ultra-fast instant rendering
 */
import api from './api';
import { normalizeMovieResponse } from '@/utils/movieNormalizer';

const clientCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

function cachedGet(url, params = {}) {
  const cacheKey = `${url}?${JSON.stringify(params)}`;
  const cached = clientCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }
  return api.get(url, { params }).then((res) => {
    const normalized = normalizeMovieResponse(res);
    clientCache.set(cacheKey, { data: normalized, timestamp: now });
    return normalized;
  });
}

const movieService = {
  getAll: (params) => cachedGet('/movies', params),
  getById: (id) => cachedGet(`/movies/${id}`),
  search: (query, filters) => api.get('/movies/search', { params: { q: query, ...filters } }).then(normalizeMovieResponse),
  getByGenre: (genre, params) => cachedGet('/movies/genre', { genre, ...params }),
  getTrending: () => cachedGet('/movies/trending'),
  getRecommended: (params) => api.get('/movies/recommended', { params }).then(normalizeMovieResponse),
  getSimilar: (id) => cachedGet(`/movies/${id}/similar`),
  create: (data) => {
    clientCache.clear();
    return api.post('/movies', data).then(normalizeMovieResponse);
  },
  update: (id, data) => {
    clientCache.clear();
    return api.put(`/movies/${id}`, data).then(normalizeMovieResponse);
  },
  delete: (id) => {
    clientCache.clear();
    return api.delete(`/movies/${id}`);
  },
  recordView: (id) => api.post(`/movies/${id}/view`),
  clearCache: () => clientCache.clear(),
};

export default movieService;

