import mongoose from 'mongoose';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import Watchlist from '../models/Watchlist.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteAsset } from '../services/cloudinaryService.js';


/**
 * GET /api/admin/dashboard
 * Returns aggregated analytics for the admin overview panel:
 * - Platform-wide counts (users, movies, reviews, watchlist entries)
 * - Recent platform activity feed
 * - Top performing movies by view count
 * - Genre distribution across the catalog
 * - Monthly user signup trend (last 12 months)
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalMovies,
    totalReviews,
    totalWatchlistEntries,
    recentActivity,
    topMovies,
    totalViewsRes,
    trailerStartsRes,
    totalLikesRes,
  ] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Review.countDocuments(),
    Watchlist.countDocuments(),
    Activity.find()
      .sort('-createdAt')
      .limit(15)
      .populate('user', 'name avatar')
      .populate('movie', 'title'),
    Movie.find().sort('-views').limit(5).select('title views likes rating'),
    Movie.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    User.aggregate([
      { $project: { count: { $size: { $ifNull: ['$trailerHistory', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]),
    User.aggregate([
      { $project: { count: { $size: { $ifNull: ['$likedMovies', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]),
  ]);

  const totalViews = totalViewsRes[0]?.total || 0;
  const totalTrailerStarts = trailerStartsRes[0]?.total || 0;
  const totalLikes = totalLikesRes[0]?.total || 0;

  // Aggregate popular genres based on user interactions: likes, reviews, watchlist
  const [usersWithLikes, reviewsWithMovies, watchlistsWithMovies] = await Promise.all([
    User.find().select('likedMovies').populate('likedMovies', 'genres'),
    Review.find().populate('movie', 'genres'),
    Watchlist.find().populate('movie', 'genres'),
  ]);

  const interestGenreMap = {};
  const addGenresToMap = (movies) => {
    movies.forEach((m) => {
      if (m && Array.isArray(m.genres)) {
        m.genres.forEach((g) => {
          interestGenreMap[g] = (interestGenreMap[g] || 0) + 1;
        });
      }
    });
  };

  addGenresToMap(usersWithLikes.flatMap((u) => u.likedMovies || []));
  addGenresToMap(reviewsWithMovies.map((r) => r.movie).filter(Boolean));
  addGenresToMap(watchlistsWithMovies.map((w) => w.movie).filter(Boolean));

  const popularGenres = Object.entries(interestGenreMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Genre distribution across all movies in the catalog
  const genreDistribution = await Movie.aggregate([
    { $unwind: '$genres' },
    { $group: { _id: '$genres', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // Monthly signup counts for the past 12 months
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const monthlySignups = await User.aggregate([
    { $match: { createdAt: { $gte: oneYearAgo } } },
    { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      userCount: totalUsers,
      movieCount: totalMovies,
      reviewCount: totalReviews,
      watchlistEntries: totalWatchlistEntries,
      recentActivity,
      topMovies,
      genreDistribution: genreDistribution.map((item) => ({
        name: item._id,
        count: item.count,
      })),
      monthlySignups,
      totalViews,
      totalTrailerStarts,
      totalLikes,
      popularGenres,
    },
  });
});

/**
 * GET /api/admin/users
 * Returns a paginated list of all registered users with optional search.
 * Query params: page, limit, q (search by name or email)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q: searchQuery } = req.query;

  const filter = {};
  if (searchQuery) {
    filter.$or = [
      { name: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
    ];
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    total: totalCount,
    pages: Math.ceil(totalCount / limit),
  });
});

/**
 * PUT /api/admin/users/:id/role
 * Promotes or demotes a user between 'user' and 'admin' roles.
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be "user" or "admin".');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!updatedUser) throw new ApiError(404, 'User not found.');

  res.json({ success: true, data: updatedUser, message: `User role updated to "${role}".` });
});

/**
 * DELETE /api/admin/users/:id
 * Permanently deletes a user and all their associated data:
 * - Cloudinary avatar asset
 * - All watchlist entries
 * - All submitted reviews
 * - All activity log entries
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Remove Cloudinary avatar if it was uploaded
  if (user.avatar?.publicId) {
    await deleteAsset(user.avatar.publicId, 'image');
  }

  // Pre-query the user's reviews to identify affected movies
  const userReviews = await Review.find({ user: user._id });
  const movieIds = userReviews.map((r) => r.movie);

  // Cascade delete all user-related data in parallel
  await Promise.all([
    Watchlist.deleteMany({ user: user._id }),
    Review.deleteMany({ user: user._id }),
    Activity.deleteMany({ user: user._id }),
    User.findByIdAndDelete(user._id),
  ]);

  // Recalculate movie statistics for any movies reviewed by this user
  if (movieIds.length > 0) {
    const uniqueMovieIds = [...new Set(movieIds.map((id) => id.toString()))];
    for (const movieId of uniqueMovieIds) {
      const agg = await Review.aggregate([
        { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      await Movie.findByIdAndUpdate(movieId, {
        avgUserRating: agg.length ? Math.round(agg[0].avg * 10) / 10 : 0,
        reviewCount: agg.length ? agg[0].count : 0,
      });
    }
  }

  res.json({ success: true, message: 'User and all associated data deleted, and movie ratings recalculated.' });
});
