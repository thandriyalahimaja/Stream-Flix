import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import Watchlist from '../models/Watchlist.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteAsset } from '../services/cloudinaryService.js';
import { getRecommendations } from '../services/recommendationService.js';

/**
 * GET /api/movies
 * Returns a paginated, sorted list of all movies.
 * Query params: page, limit, sort (default: -rating)
 */
export const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = '-rating' } = req.query;
  const skipCount = (Number(page) - 1) * Number(limit);

  const [movies, totalCount] = await Promise.all([
    Movie.find().sort(sort).skip(skipCount).limit(Number(limit)),
    Movie.countDocuments(),
  ]);

  res.json({
    success: true,
    data: movies,
    total: totalCount,
    page: Number(page),
    pages: Math.ceil(totalCount / Number(limit)),
  });
});

/**
 * GET /api/movies/:id
 * Returns a single movie by ID including its 10 most recent reviews.
 * Also increments the movie's view count.
 */
export const getById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Movie not found (invalid ID format).');
  }

  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, 'Movie not found.');

  // Track views
  movie.views += 1;
  await movie.save();

  const recentReviews = await Review.find({ movie: movie._id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  res.json({ success: true, data: { ...movie.toObject(), reviews: recentReviews } });
});

/**
 * GET /api/movies/search
 * Searches movies by text query, genre filter, and/or year filter.
 * Query params: q (text), genre, year, page, limit
 */
export const search = asyncHandler(async (req, res) => {
  const { q: searchQuery, genre, year, page = 1, limit = 16 } = req.query;

  const filter = {};
  if (searchQuery) filter.$text = { $search: searchQuery };
  if (genre && genre !== 'All') filter.genres = genre;
  if (year) filter.year = Number(year);

  const skipCount = (Number(page) - 1) * Number(limit);

  const [movies, totalCount] = await Promise.all([
    Movie.find(filter).skip(skipCount).limit(Number(limit)),
    Movie.countDocuments(filter),
  ]);

  res.json({ success: true, data: movies, total: totalCount });
});

/**
 * GET /api/movies/genre
 * Returns movies filtered by a specific genre, sorted by rating.
 * Query params: genre, limit
 */
export const getByGenre = asyncHandler(async (req, res) => {
  const { genre, limit = 20 } = req.query;
  const movies = await Movie.find({ genres: genre }).sort('-rating').limit(Number(limit));
  res.json({ success: true, data: movies });
});

/**
 * GET /api/movies/trending
 * Returns the 10 most-viewed movies (highest view count first).
 */
export const getTrending = asyncHandler(async (req, res) => {
  const trendingMovies = await Movie.find().sort('-views').limit(10);
  res.json({ success: true, data: trendingMovies });
});

/**
 * GET /api/movies/recommended
 * Returns personalized recommendations for the authenticated user.
 *
 * Uses the recommendation service which scores movies based on:
 * - Genres from liked movies (strong signal, ×2 weight)
 * - Genres from watch history (moderate signal, ×1 weight)
 * - Genres from user profile preferences (×1 weight)
 * - IMDb rating bonus for movies rated >= 8.0
 *
 * Falls back to top-rated movies for new users with no interaction history.
 */
export const getRecommended = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;

  const allMovies = await Movie.find();

  let preferredGenres = [];
  let likedMovies = [];
  let watchHistory = [];

  if (req.user) {
    const userWithHistory = await User.findById(req.user.id)
      .populate('likedMovies', 'genres rating _id')
      .populate('watchHistory.movie', 'genres rating _id');

    preferredGenres = userWithHistory?.preferences?.genres || [];
    likedMovies = (userWithHistory?.likedMovies || []).filter(Boolean);
    watchHistory = (userWithHistory?.watchHistory || []).filter(
      (entry) => entry && entry.movie
    );
  }

  const recommendedMovies = getRecommendations({
    preferredGenres,
    likedMovies,
    watchHistory,
    allMovies,
    limit: 12,
  });

  res.json({ success: true, data: recommendedMovies });
});

/**
 * POST /api/movies
 * Admin only — creates a new movie entry in the catalog.
 */
export const create = asyncHandler(async (req, res) => {
  const newMovie = await Movie.create(req.body);
  res.status(201).json({ success: true, data: newMovie, message: 'Movie created successfully.' });
});

/**
 * PUT /api/movies/:id
 * Admin only — updates an existing movie.
 * Automatically cleans up replaced Cloudinary media assets.
 */
export const update = asyncHandler(async (req, res) => {
  const existingMovie = await Movie.findById(req.params.id);
  if (!existingMovie) throw new ApiError(404, 'Movie not found.');

  // If poster is being replaced, delete the old Cloudinary asset
  if (
    req.body.poster?.publicId &&
    existingMovie.poster?.publicId &&
    req.body.poster.publicId !== existingMovie.poster.publicId
  ) {
    await deleteAsset(existingMovie.poster.publicId, 'image');
  }

  // If backdrop is being replaced, delete the old Cloudinary asset
  if (
    req.body.backdrop?.publicId &&
    existingMovie.backdrop?.publicId &&
    req.body.backdrop.publicId !== existingMovie.backdrop.publicId
  ) {
    await deleteAsset(existingMovie.backdrop.publicId, 'image');
  }

  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updatedMovie, message: 'Movie updated successfully.' });
});

/**
 * DELETE /api/movies/:id
 * Admin only — deletes a movie and cleans up all associated data:
 * - Cloudinary poster and backdrop assets
 * - All reviews for the movie
 */
export const remove = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, 'Movie not found.');

  // Clean up Cloudinary assets in parallel
  const cloudinaryCleanup = [];
  if (movie.poster?.publicId) cloudinaryCleanup.push(deleteAsset(movie.poster.publicId, 'image'));
  if (movie.backdrop?.publicId) cloudinaryCleanup.push(deleteAsset(movie.backdrop.publicId, 'image'));
  await Promise.allSettled(cloudinaryCleanup);

  // Delete the movie and all its associated reviews and watchlist entries
  await Movie.findByIdAndDelete(req.params.id);
  await Review.deleteMany({ movie: req.params.id });
  await Watchlist.deleteMany({ movie: req.params.id });

  res.json({ success: true, message: 'Movie and all associated reviews deleted.' });
});
