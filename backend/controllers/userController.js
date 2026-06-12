import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile data.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, data: user });
});

/**
 * PUT /api/users/profile
 * Updates the authenticated user's display name and genre preferences.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;

  if (preferences) {
    // Fetch existing preferences from DB first to avoid overwriting unrelated fields
    const existingUser = await User.findById(req.user.id).select('preferences');
    updateFields.preferences = {
      ...(existingUser?.preferences?.toObject() || {}),
      ...preferences,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
  res.json({ success: true, data: updatedUser, message: 'Profile updated successfully.' });
});

/**
 * GET /api/users/history
 * Returns the authenticated user's watch history, sorted by most recent, with pagination.
 */
export const getWatchHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.user.id)
    .select('watchHistory')
    .populate('watchHistory.movie', 'title poster duration rating year genres');

  const validHistory = (user?.watchHistory || []).filter(
    (entry) => entry && entry.movie !== null
  );

  const sortedHistory = validHistory.sort(
    (entryA, entryB) => new Date(entryB.watchedAt) - new Date(entryA.watchedAt)
  );

  const startIndex = (page - 1) * limit;
  const paginatedHistory = sortedHistory.slice(startIndex, startIndex + Number(limit));

  res.json({ success: true, data: paginatedHistory, total: sortedHistory.length });
});

/**
 * POST /api/users/history
 * Records or updates a watch event. Updates progress if the movie was already watched.
 */
export const addToWatchHistory = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findById(req.user.id);

  const existingEntry = user.watchHistory.find(
    (entry) => String(entry.movie) === String(movieId)
  );

  if (existingEntry) {
    existingEntry.watchedAt = new Date();
  } else {
    user.watchHistory.push({ movie: movieId, startedTrailer: true });
  }

  await user.save();

  // Log activity of type 'watch' (Trailer play) for recent activity feed
  await Activity.create({
    user: req.user.id,
    type: 'watch',
    movie: movieId,
  });

  res.json({ success: true, message: 'Trailer start recorded.' });
});

/**
 * POST /api/users/like/:movieId
 * Toggles a like on a movie. If already liked, removes the like (unlike).
 * If the movie was previously disliked, the dislike is removed automatically.
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const user = await User.findById(req.user.id);

  // Safe ObjectId comparison using String() coercion
  const likedIndex = user.likedMovies.findIndex(
    (id) => String(id) === String(movieId)
  );
  const dislikedIndex = user.dislikedMovies.findIndex(
    (id) => String(id) === String(movieId)
  );

  let action;

  if (likedIndex > -1) {
    // Movie is already liked — remove the like (toggle off)
    user.likedMovies.splice(likedIndex, 1);
    await Movie.findByIdAndUpdate(movieId, { $inc: { likes: -1 } });
    action = 'unliked';
  } else {
    // Like the movie
    user.likedMovies.push(movieId);
    await Movie.findByIdAndUpdate(movieId, { $inc: { likes: 1 } });

    // Remove dislike if the user had previously disliked this movie
    if (dislikedIndex > -1) {
      user.dislikedMovies.splice(dislikedIndex, 1);
      await Movie.findByIdAndUpdate(movieId, { $inc: { dislikes: -1 } });
    }
    action = 'liked';
    await Activity.create({
      user: req.user.id,
      type: 'like',
      movie: movieId,
    });
  }

  await user.save();
  res.json({ success: true, action, likedMovies: user.likedMovies });
});

/**
 * POST /api/users/dislike/:movieId
 * Toggles a dislike on a movie. If already disliked, removes the dislike.
 * If the movie was previously liked, the like is removed automatically.
 */
export const toggleDislike = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const user = await User.findById(req.user.id);

  // Safe ObjectId comparison using String() coercion
  const dislikedIndex = user.dislikedMovies.findIndex(
    (id) => String(id) === String(movieId)
  );
  const likedIndex = user.likedMovies.findIndex(
    (id) => String(id) === String(movieId)
  );

  let action;

  if (dislikedIndex > -1) {
    // Movie is already disliked — remove the dislike (toggle off)
    user.dislikedMovies.splice(dislikedIndex, 1);
    await Movie.findByIdAndUpdate(movieId, { $inc: { dislikes: -1 } });
    action = 'undisliked';
  } else {
    // Dislike the movie
    user.dislikedMovies.push(movieId);
    await Movie.findByIdAndUpdate(movieId, { $inc: { dislikes: 1 } });

    // Remove like if the user had previously liked this movie
    if (likedIndex > -1) {
      user.likedMovies.splice(likedIndex, 1);
      await Movie.findByIdAndUpdate(movieId, { $inc: { likes: -1 } });
    }
    action = 'disliked';
  }

  await user.save();
  res.json({ success: true, action, dislikedMovies: user.dislikedMovies });
});

/**
 * GET /api/users/dashboard
 * Returns aggregated statistics for the authenticated user's dashboard:
 * - Total watch hours, watchlist count, review count, liked count
 * - Genre breakdown from liked + watched movies
 * - Average rating given by the user
 * - Weekly watch activity (hours per day over the last 7 days)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, watchlistCount, reviewCount, userReviews] = await Promise.all([
    User.findById(userId)
      .populate('watchHistory.movie', 'genres duration')
      .populate('likedMovies', 'genres'),
    Watchlist.countDocuments({ user: userId }),
    Review.countDocuments({ user: userId }),
    Review.find({ user: userId }).select('rating'),
  ]);

  const validLikedMovies = (user.likedMovies || []).filter(Boolean);
  const validWatchHistory = (user.watchHistory || []).filter(
    (entry) => entry && entry.movie
  );

  // Build genre frequency map from liked movies and watch history
  const genreFrequencyMap = {};
  const allGenres = [
    ...validLikedMovies.flatMap((movie) => movie.genres || []),
    ...validWatchHistory.flatMap((entry) => entry.movie.genres || []),
  ];
  allGenres.forEach((genre) => {
    genreFrequencyMap[genre] = (genreFrequencyMap[genre] || 0) + 1;
  });

  const genreMix = Object.entries(genreFrequencyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((genreA, genreB) => genreB.count - genreA.count)
    .slice(0, 6);

  // Average rating the user has given across all their reviews
  const averageRating =
    userReviews.length > 0
      ? (
          userReviews.reduce((sum, review) => sum + review.rating, 0) /
          userReviews.length
        ).toFixed(1)
      : '0';

  // Weekly watch activity: how many hours watched per day in the last 7 days
  const now = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyActivity = weekDays.map((day) => ({ d: day, h: 0 }));

  validWatchHistory.forEach((entry) => {
    const daysAgo = (now - new Date(entry.watchedAt)) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 7) {
      const dayIndex = new Date(entry.watchedAt).getDay();
      weeklyActivity[dayIndex].h += 1; // 1 play count per event
    }
  });

  res.json({
    success: true,
    data: {
      totalWatchHours: user.totalWatchHours,
      watchlistCount,
      reviewCount,
      likedCount: validLikedMovies.length,
      watchHistoryCount: validWatchHistory.length,
      avgRating: averageRating,
      genreMix,
      weeklyActivity,
      topGenre: genreMix[0]?.name || 'None yet',
    },
  });
});
