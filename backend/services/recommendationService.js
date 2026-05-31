/**
 * Recommendation Service
 *
 * Implements a content-based filtering algorithm to generate personalized
 * movie recommendations for authenticated users.
 *
 * Algorithm overview (viva-friendly explanation):
 * 1. Collect the user's genre signals from three sources:
 *    - Preferred genres set in their profile preferences
 *    - Genres from movies they have LIKED (strong signal)
 *    - Genres from movies in their WATCH HISTORY (moderate signal)
 *
 * 2. For each candidate movie in the database:
 *    - Calculate a relevance score based on genre overlap with user signals
 *    - Add a bonus for highly-rated movies (IMDb rating above 8.0)
 *    - Exclude movies the user has already watched or liked
 *
 * 3. Return the top-ranked movies sorted by score descending.
 *
 * Complexity: O(n × g) where n = movie count, g = genre count per movie.
 * No machine learning, no collaborative filtering — pure content-based scoring.
 */

/**
 * Build a genre frequency map from an array of movies.
 * Movies that appear multiple times (e.g. liked + watched) receive higher weight.
 *
 * @param {Array} movies - Array of movie objects with a `genres` field
 * @returns {Object} - Map of genre → frequency count
 */
function buildGenreFrequencyMap(movies) {
  const genreMap = {};
  movies.forEach((movie) => {
    if (!movie || !Array.isArray(movie.genres)) return;
    movie.genres.forEach((genre) => {
      genreMap[genre] = (genreMap[genre] || 0) + 1;
    });
  });
  return genreMap;
}

/**
 * Score a single candidate movie against the user's genre interest map.
 *
 * Scoring rules:
 * - +2 points for each genre in the candidate that matches a user-preferred genre
 * - Bonus multiplied by the frequency of that genre in the user's history
 * - +1 bonus point if the movie's IMDb rating is >= 8.0 (quality boost)
 *
 * @param {Object} candidateMovie - Movie document from MongoDB
 * @param {Object} genreInterestMap - Genre → frequency map for the user
 * @returns {number} - Relevance score (higher = more relevant)
 */
function scoreMovieForUser(candidateMovie, genreInterestMap) {
  let relevanceScore = 0;

  candidateMovie.genres.forEach((genre) => {
    if (genreInterestMap[genre]) {
      // Weight by how frequently this genre appears in the user's history
      relevanceScore += 2 * genreInterestMap[genre];
    }
  });

  // Quality bonus: reward highly-rated movies
  if (candidateMovie.rating >= 8.0) {
    relevanceScore += 1;
  }

  return relevanceScore;
}

/**
 * Generate personalized movie recommendations for a user.
 *
 * @param {Object} params
 * @param {string[]} params.preferredGenres - Genres from the user's profile preferences
 * @param {Object[]} params.likedMovies - Array of movies the user has liked (populated, with genres)
 * @param {Object[]} params.watchHistory - Array of watch history entries (populated, with movie.genres)
 * @param {Object[]} params.allMovies - Full catalog of movies from the database
 * @param {number} [params.limit=12] - Maximum number of recommendations to return
 * @returns {Object[]} - Recommended movie documents sorted by relevance score
 */
export function getRecommendations({
  preferredGenres = [],
  likedMovies = [],
  watchHistory = [],
  allMovies = [],
  limit = 12,
}) {
  if (allMovies.length === 0) return [];

  // Build the set of movie IDs the user has already interacted with
  const watchedMovieIds = new Set(
    watchHistory
      .filter((entry) => entry && entry.movie)
      .map((entry) => String(entry.movie._id || entry.movie))
  );

  const likedMovieIds = new Set(
    likedMovies.filter(Boolean).map((movie) => String(movie._id || movie))
  );

  const seenMovieIds = new Set([...watchedMovieIds, ...likedMovieIds]);

  // Build genre interest map with weighted signals
  // Liked movies signal is stronger (× 2) than watch history (× 1)
  const preferenceMovies = preferredGenres.map((genre) => ({ genres: [genre] }));
  const likedGenreMap = buildGenreFrequencyMap(likedMovies.filter(Boolean));
  const watchedGenreMap = buildGenreFrequencyMap(
    watchHistory.filter((e) => e && e.movie).map((e) => e.movie)
  );
  const preferenceGenreMap = buildGenreFrequencyMap(preferenceMovies);

  // Merge all genre signals into one weighted map
  const combinedGenreMap = {};
  Object.entries(likedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 2;
  });
  Object.entries(watchedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count;
  });
  Object.entries(preferenceGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count;
  });

  // If the user has no interaction history, fall back to top-rated movies
  const hasUserSignals = Object.keys(combinedGenreMap).length > 0;
  if (!hasUserSignals) {
    return allMovies
      .filter((movie) => !seenMovieIds.has(String(movie._id)))
      .sort((movieA, movieB) => movieB.rating - movieA.rating)
      .slice(0, limit);
  }

  // Score all unseen candidate movies
  const scoredMovies = allMovies
    .filter((movie) => !seenMovieIds.has(String(movie._id)))
    .map((movie) => ({
      movie,
      score: scoreMovieForUser(movie, combinedGenreMap),
    }))
    .filter(({ score }) => score > 0);

  // Sort by score descending, use rating as tiebreaker
  scoredMovies.sort((itemA, itemB) => {
    if (itemB.score !== itemA.score) return itemB.score - itemA.score;
    return itemB.movie.rating - itemA.movie.rating;
  });

  return scoredMovies.slice(0, limit).map(({ movie }) => movie);
}

/**
 * Find movies similar to a given movie based on shared genres.
 * Used on the Movie Details page ("More Like This" section).
 *
 * @param {string} movieId - The ID of the reference movie
 * @param {Object[]} allMovies - Full catalog of movies
 * @param {number} [limit=6] - Maximum number of similar movies to return
 * @returns {Object[]} - Similar movies sorted by rating
 */
export function getSimilarMovies(movieId, allMovies, limit = 6) {
  const referenceMovie = allMovies.find(
    (movie) => String(movie._id) === String(movieId)
  );
  if (!referenceMovie) return [];

  return allMovies
    .filter(
      (movie) =>
        String(movie._id) !== String(movieId) &&
        movie.genres.some((genre) => referenceMovie.genres.includes(genre))
    )
    .sort((movieA, movieB) => movieB.rating - movieA.rating)
    .slice(0, limit);
}
