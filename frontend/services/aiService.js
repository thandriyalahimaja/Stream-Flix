import api from './api';
import { normalizeMovieResponse } from '@/utils/movieNormalizer';

/**
 * Natural-Language AI Movie Discovery Service
 */
const aiService = {
  /**
   * Search movies using natural language intent extraction and hybrid vector retrieval.
   *
   * @param {string} query
   * @param {Object} [options={}]
   * @param {number} [options.limit=12]
   * @param {boolean} [options.debug=false]
   * @returns {Promise<Object>}
   */
  searchWithAI: (query, options = {}) =>
    api.post('/ai/search', { query, ...options }).then(normalizeMovieResponse),

  /**
   * Fetch in-memory cache diagnostics.
   */
  getCacheStats: () => api.get('/ai/cache-stats'),

  /**
   * Fetch grounded, explainable recommendation justification ("Why this movie?").
   *
   * @param {string} movieId
   * @param {Object} [options={}]
   * @param {string} [options.contextType='personalized'] - 'personalized' | 'search'
   * @param {string} [options.query=''] - Required if contextType === 'search'
   * @returns {Promise<Object>}
   */
  explainRecommendation: (movieId, options = {}) =>
    api.post('/ai/explain-recommendation', {
      movieId,
      contextType: options.contextType || 'personalized',
      query: options.query || '',
    }),

  /**
   * Fetch private on-demand grounded user taste profile (Phase 6).
   *
   * @returns {Promise<Object>}
   */
  getTasteProfile: () => api.get('/ai/taste-profile'),
};

export default aiService;
