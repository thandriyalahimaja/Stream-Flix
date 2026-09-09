import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import Watchlist from '../models/Watchlist.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteAsset } from '../services/cloudinaryService.js';
import { getRecommendations } from '../services/recommendationService.js';
import { syncDbToSeedFile } from '../utils/syncDbToSeed.js';

let cachedCatalog = null;
let cachedCatalogTime = 0;

export async function getCachedMovieCatalog() {
  const now = Date.now();
  if (cachedCatalog && now - cachedCatalogTime < 10 * 60 * 1000) {
    return cachedCatalog;
  }
  cachedCatalog = await Movie.find().lean();
  cachedCatalogTime = now;
  return cachedCatalog;
}

export function invalidateMovieCatalogCache() {
  cachedCatalog = null;
  cachedCatalogTime = 0;
}

/**
 * GET /api/movies
 * Returns a paginated, sorted list of all movies.
 * Query params: page, limit, sort (default: -rating), industry, language, genre, year
 */
export const getAll = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 24,
    sort = '-rating',
    industry,
    language,
    genre,
    year,
  } = req.query;

  const filter = {};
  if (industry && industry !== 'All') {
    filter.industry = new RegExp(`^${industry}$`, 'i');
  }
  if (language && language !== 'All') {
    filter.$or = [
      { language: new RegExp(`^${language}$`, 'i') },
      { languageName: new RegExp(`^${language}$`, 'i') },
    ];
  }
  if (genre && genre !== 'All') {
    filter.genres = genre;
  }
  if (year) {
    filter.year = Number(year);
  }

  // Parse sort param
  let sortOption = { rating: -1, _id: 1 };
  if (sort === 'year' || sort === '-year' || sort === 'latest') {
    sortOption = { year: -1, rating: -1, _id: 1 };
  } else if (sort === 'views' || sort === '-views' || sort === 'popular') {
    sortOption = { views: -1, rating: -1, _id: 1 };
  } else if (sort === 'title') {
    sortOption = { title: 1, _id: 1 };
  } else if (typeof sort === 'string' && sort.startsWith('-')) {
    sortOption = { [sort.substring(1)]: -1, _id: 1 };
  } else if (typeof sort === 'string' && sort) {
    sortOption = { [sort]: -1, _id: 1 };
  }

  const skipCount = (Number(page) - 1) * Number(limit);

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  const [movies, totalCount] = await Promise.all([
    Movie.find(filter)
      .select('-embedding -embeddingText')
      .lean()
      .sort(sortOption)
      .skip(skipCount)
      .limit(Number(limit)),
    Movie.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: movies,
    total: totalCount,
    page: Number(page),
    pages: Math.ceil(totalCount / Number(limit)),
  });
});

export const getById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Movie not found (invalid ID format).');
  }

  const movie = await Movie.findById(req.params.id)
    .select('-embedding -embeddingText')
    .lean();
  if (!movie) throw new ApiError(404, 'Movie not found.');

  const recentReviews = await Review.find({ movie: movie._id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10)
    .lean();

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json({ success: true, data: { ...movie, reviews: recentReviews } });
});

/**
 * POST /api/movies/:id/view
 * Increments the movie's view count after 5 seconds of client stay.
 */
export const recordView = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Movie not found (invalid ID format).');
  }

  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, 'Movie not found.');

  movie.views += 1;
  await movie.save();

  res.json({ success: true, message: 'View count updated.' });
});

/**
 * GET /api/movies/search
 * Searches movies by text query, genre filter, industry, language, and/or year filter.
 * Query params: q (text), genre, year, industry, language, page, limit
 */
export const search = asyncHandler(async (req, res) => {
  const { q: searchQuery, genre, year, industry, language, page = 1, limit = 16 } = req.query;

  const filter = {};
  if (searchQuery) filter.$text = { $search: searchQuery };
  if (genre && genre !== 'All') filter.genres = genre;
  if (year) filter.year = Number(year);
  if (industry && industry !== 'All') filter.industry = new RegExp(`^${industry}$`, 'i');
  if (language && language !== 'All') {
    filter.$or = [
      { language: new RegExp(`^${language}$`, 'i') },
      { languageName: new RegExp(`^${language}$`, 'i') },
    ];
  }

  const skipCount = (Number(page) - 1) * Number(limit);

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  const [movies, totalCount] = await Promise.all([
    Movie.find(filter)
      .select('-embedding -embeddingText')
      .lean()
      .skip(skipCount)
      .limit(Number(limit)),
    Movie.countDocuments(filter),
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
 * GET /api/movies/genre
 * Returns movies filtered by a specific genre, sorted by rating.
 * Query params: genre, limit
 */
export const getByGenre = asyncHandler(async (req, res) => {
  const { genre, limit = 20 } = req.query;
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
  const movies = await Movie.find({ genres: genre })
    .select('-embedding -embeddingText')
    .lean()
    .sort('-rating')
    .limit(Number(limit));
  res.json({ success: true, data: movies });
});

/**
 * GET /api/movies/trending
 * Returns the 10 most-viewed movies (highest view count first).
 */
export const getTrending = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
  const trendingMovies = await Movie.find()
    .select('-embedding -embeddingText')
    .lean()
    .sort('-views')
    .limit(10);
  res.json({ success: true, data: trendingMovies });
});

/**
 * GET /api/movies/recommended
 * Returns personalized recommendations for the authenticated user.
 */
export const getRecommended = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;

  // Use fast in-memory cached catalog instead of fetching 10MB across MongoDB Atlas network
  const allMovies = await getCachedMovieCatalog();

  let preferredGenres = req.query.genres ? req.query.genres.split(',').map(s => s.trim()).filter(Boolean) : [];
  let preferredLanguage = req.query.language || req.query.preferredLanguage || null;
  let likedMovies = [];
  let dislikedMovies = [];
  let watchHistory = [];
  let userReviews = [];
  let watchlistMovies = [];

  if (req.user) {
    const [userWithHistory, reviews, userWatchlist] = await Promise.all([
      User.findById(req.user.id)
        .populate('likedMovies', 'genres rating director cast language _id embedding')
        .populate('dislikedMovies', 'genres rating director cast language _id embedding')
        .populate('trailerHistory.movie', 'genres rating director cast language _id embedding'),
      Review.find({ user: req.user.id }).populate('movie', 'genres rating director cast language _id embedding'),
      Watchlist.find({ user: req.user.id }).populate('movie', 'genres rating director cast language _id embedding'),
    ]);

    if (preferredGenres.length === 0) {
      preferredGenres = userWithHistory?.preferences?.genres || [];
    }
    if (!preferredLanguage && userWithHistory?.preferences?.subtitleLang && userWithHistory.preferences.subtitleLang !== 'English') {
      preferredLanguage = userWithHistory.preferences.subtitleLang;
    }
    likedMovies = (userWithHistory?.likedMovies || []).filter(Boolean);
    dislikedMovies = (userWithHistory?.dislikedMovies || []).filter(Boolean);
    watchHistory = (userWithHistory?.trailerHistory || []).filter(
      (entry) => entry && entry.movie
    );
    userReviews = (reviews || []).filter(r => r && r.movie);
    watchlistMovies = (userWatchlist || []).map((w) => w.movie).filter(Boolean);
  }

  const includeDebug = req.query.debug === 'true';

  const recommendedMovies = getRecommendations({
    userId: req.user?.id || null,
    preferredGenres,
    preferredLanguage,
    likedMovies,
    dislikedMovies,
    userReviews,
    watchlistMovies,
    watchHistory,
    allMovies,
    limit: 12,
    includeDebug,
  });

  // Strip massive embedding vector floats from payload before sending to browser
  const sanitized = recommendedMovies.map((m) => {
    if (m.embedding || m.embeddingText) {
      const { embedding, embeddingText, ...rest } = m;
      return rest;
    }
    return m;
  });

  res.json({ success: true, data: sanitized });
});

/**
 * POST /api/movies
 * Admin only — creates a new movie entry in the catalog.
 */
export const create = asyncHandler(async (req, res) => {
  const newMovie = await Movie.create(req.body);
  invalidateMovieCatalogCache();
  await syncDbToSeedFile();
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
  invalidateMovieCatalogCache();
  await syncDbToSeedFile();

  res.json({ success: true, data: updatedMovie, message: 'Movie updated successfully.' });
});

/**
 * DELETE /api/movies/:id
 * Admin only — deletes a movie and cleans up all associated data:
 * - Cloudinary poster and backdrop assets
 * - All reviews for the movie
 * - User interactions (likedMovies, dislikedMovies, watchHistory)
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

  // Cascade cleanup: remove movie reference from user profiles
  const User = (await import('../models/User.js')).default;
  await User.updateMany(
    {},
    {
      $pull: {
        likedMovies: req.params.id,
        dislikedMovies: req.params.id,
        watchHistory: { movie: req.params.id }
      }
    }
  );

  invalidateMovieCatalogCache();
  await syncDbToSeedFile();

  res.json({ success: true, message: 'Movie and all associated reviews and interactions deleted.' });
});

/**
 * GET /api/movies/:id/similar
 * Returns up to 6 movies sharing genres with the target movie.
 */
export const getSimilar = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Movie not found (invalid ID format).');
  }

  const movie = await Movie.findById(req.params.id).select('genres').lean();
  if (!movie) throw new ApiError(404, 'Movie not found.');

  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
  const similarMovies = await Movie.find({
    _id: { $ne: movie._id },
    genres: { $in: movie.genres || [] }
  })
    .select('-embedding -embeddingText')
    .lean()
    .limit(6);

  res.json({ success: true, data: similarMovies });
});
