/**
 * Review API service
 */
import api from './api';

const reviewService = {
  getByMovie: (movieId) => api.get(`/reviews/${movieId}`),
  create: (data) => api.post('/reviews', data), // data: { movieId, rating, comment }
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default reviewService;
