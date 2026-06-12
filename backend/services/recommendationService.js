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
    // Deduplicate genres for this movie to avoid counting the same genre multiple times for one movie
    const uniqueGenres = new Set(movie.genres.map(g => String(g).trim()));
    uniqueGenres.forEach((genre) => {
      if (genre) {
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      }
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

  if (!candidateMovie || !Array.isArray(candidateMovie.genres)) return 0;

  // Deduplicate genres in candidate movie to avoid counting duplicate genres twice
  const uniqueGenres = new Set(candidateMovie.genres.map(g => String(g).trim()));
  uniqueGenres.forEach((genre) => {
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
  watchHistory = [], // Represents Trailer Starts
  reviewedMovies = [],
  watchlistMovies = [],
  allMovies = [],
  limit = 12,
}) {
  if (allMovies.length === 0) return [];

  // Exclude movies the user has already liked or reviewed
  const reviewedMovieIds = new Set(
    reviewedMovies.filter(Boolean).map((m) => String(m._id || m))
  );
  const likedMovieIds = new Set(
    likedMovies.filter(Boolean).map((m) => String(m._id || m))
  );
  const seenMovieIds = new Set([...reviewedMovieIds, ...likedMovieIds]);

  // Build genre frequency maps for all signals
  const uniquePreferredGenres = Array.from(new Set(preferredGenres.filter(Boolean).map(g => String(g).trim())));
  const preferenceMovies = uniquePreferredGenres.map((genre) => ({ genres: [genre] }));
  const likedGenreMap = buildGenreFrequencyMap(likedMovies.filter(Boolean));
  // Deduplicate trailer starts to only count each movie once
  const uniqueWatchedMovies = [];
  const seenWatchIds = new Set();
  watchHistory.forEach((entry) => {
    if (entry && entry.movie) {
      const mid = String(entry.movie._id || entry.movie);
      if (!seenWatchIds.has(mid)) {
        seenWatchIds.add(mid);
        uniqueWatchedMovies.push(entry.movie);
      }
    }
  });

  const watchedGenreMap = buildGenreFrequencyMap(uniqueWatchedMovies);
  const reviewedGenreMap = buildGenreFrequencyMap(reviewedMovies.filter(Boolean));
  const watchlistGenreMap = buildGenreFrequencyMap(watchlistMovies.filter(Boolean));
  const preferenceGenreMap = buildGenreFrequencyMap(preferenceMovies);

  // Merge all genre signals into one weighted map
  const combinedGenreMap = {};
  
  // Weight 5: Reviews
  Object.entries(reviewedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 5;
  });

  // Weight 4: Likes
  Object.entries(likedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 4;
  });

  // Weight 3: Watchlist
  Object.entries(watchlistGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 3;
  });

  // Weight 2: Trailer Starts (contribution capped at max 2 per genre)
  Object.entries(watchedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + Math.min(count, 1) * 2;
  });

  // Weight 1: Preferred Genres
  Object.entries(preferenceGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 1;
  });

  // If the user has no interaction history, fall back to top-rated movies (stable sorting)
  const hasUserSignals = Object.keys(combinedGenreMap).length > 0;
  if (!hasUserSignals) {
    return allMovies
      .filter((movie) => !seenMovieIds.has(String(movie._id)))
      .sort((movieA, movieB) => {
        if (movieB.rating !== movieA.rating) return movieB.rating - movieA.rating;
        return String(movieA._id).localeCompare(String(movieB._id));
      })
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

  // Sort by score descending, use rating as tiebreaker, and movie ID for stable deterministic sorting
  scoredMovies.sort((itemA, itemB) => {
    if (itemB.score !== itemA.score) return itemB.score - itemA.score;
    if (itemB.movie.rating !== itemA.movie.rating) return itemB.movie.rating - itemA.movie.rating;
    return String(itemA.movie._id).localeCompare(String(itemB.movie._id));
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
