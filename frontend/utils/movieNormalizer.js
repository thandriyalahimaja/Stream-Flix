/**
 * Normalizes movie data by ensuring array fields (genres, cast) are guaranteed arrays.
 */
export function normalizeMovie(movie) {
  if (!movie) return movie;
  return {
    ...movie,
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    cast: Array.isArray(movie.cast) ? movie.cast : [],
  };
}

/**
 * Normalizes single or list movie responses from movieService
 */
export function normalizeMovieResponse(res) {
  if (res && res.success && res.data) {
    if (Array.isArray(res.data)) {
      res.data = res.data.map(normalizeMovie);
    } else {
      res.data = normalizeMovie(res.data);
    }
  }
  return res;
}

/**
 * Normalizes movie objects nested in watchlists or watch history from userService
 */
export function normalizeUserResponse(res) {
  if (res && res.success && res.data) {
    // Check if it's a watchlist or watch history array
    if (Array.isArray(res.data)) {
      res.data = res.data.map((item) => {
        if (item && item.movie) {
          return {
            ...item,
            movie: normalizeMovie(item.movie),
          };
        }
        return item;
      });
    } else if (res.data.likedMovies && Array.isArray(res.data.likedMovies)) {
      // Check if profile response contains likedMovies array
      res.data.likedMovies = res.data.likedMovies.map(normalizeMovie);
    }
  }
  return res;
}
