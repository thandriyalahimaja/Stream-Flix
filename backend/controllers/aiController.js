import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Watchlist from '../models/Watchlist.js';
import { searchMoviesWithAI } from '../services/aiSearchService.js';
import { aiService } from '../services/ai/aiService.js';
import { explanationEngine } from '../services/explanation/explanationEngine.js';
import { getTasteProfileForUser } from '../services/tasteProfileService.js';

/**
 * POST /api/ai/search
 * Natural-Language AI Movie Discovery.
 *
 * Transforms natural language queries into structured intent and semantic retrieval signals,
 * retrieving and scoring candidates locally using StreamFlix's hybrid engine with MMR diversity.
 *
 * Body:
 * - query: string (required, 1-500 chars)
 * - limit: number (optional, default 12, max 30)
 * - debug: boolean (optional, enables detailed score breakdown)
 */
export const searchWithAI = asyncHandler(async (req, res) => {
  const rawQuery = req.body.query || req.query.query;
  if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
    throw new ApiError(400, 'Search query is required.');
  }

  const query = rawQuery.trim();
  if (query.length > 500) {
    throw new ApiError(400, 'Query length exceeds maximum limit of 500 characters.');
  }

  const limitParam = parseInt(req.body.limit || req.query.limit || 12, 10);
  const limit = Math.max(1, Math.min(30, isNaN(limitParam) ? 12 : limitParam));
  const includeDebug = req.body.debug === true || req.query.debug === 'true';

  // 1. Fetch all movies from DB (with lean projection for speed)
  const allMovies = await Movie.find().lean();

  // 2. Fetch authenticated user context if logged in
  let likedMovies = [];
  let dislikedMovies = [];
  let userReviews = [];
  let watchlistMovies = [];
  let watchHistory = [];

  if (req.user) {
    const [userDoc, reviews, watchlistEntries] = await Promise.all([
      User.findById(req.user.id)
        .populate('likedMovies', 'genres rating director cast language _id embedding')
        .populate('dislikedMovies', 'genres rating director cast language _id embedding')
        .populate('trailerHistory.movie', 'genres rating director cast language _id embedding')
        .lean(),
      Review.find({ user: req.user.id })
        .populate('movie', 'genres rating director cast language _id embedding')
        .lean(),
      Watchlist.find({ user: req.user.id })
        .populate('movie', 'genres rating director cast language _id embedding')
        .lean(),
    ]);

    if (userDoc) {
      likedMovies = (userDoc.likedMovies || []).filter(Boolean);
      dislikedMovies = (userDoc.dislikedMovies || []).filter(Boolean);
      watchHistory = (userDoc.trailerHistory || []).filter(h => h && h.movie);
    }
    userReviews = (reviews || []).filter(r => r && r.movie);
    watchlistMovies = (watchlistEntries || []).map(w => w.movie).filter(Boolean);
  }

  // 3. Execute AI Natural Language Discovery
  const searchResult = await searchMoviesWithAI({
    query,
    allMovies,
    user: req.user || null,
    likedMovies,
    dislikedMovies,
    userReviews,
    watchlistMovies,
    watchHistory,
    limit,
    includeDebug,
  });

  res.json({
    success: true,
    query: searchResult.query,
    originalIntent: searchResult.originalIntent,
    normalizedIntent: searchResult.normalizedIntent,
    referenceMovie: searchResult.referenceMovie,
    referenceMovies: searchResult.referenceMovies,
    isFallback: searchResult.isFallback,
    source: searchResult.source,
    filtersRelaxed: searchResult.filtersRelaxed,
    relaxationApplied: searchResult.relaxationApplied,
    relaxedConstraints: searchResult.relaxedConstraints,
    latency: searchResult.latency,
    count: searchResult.results.length,
    data: searchResult.results,
  });
});

/**
 * GET /api/ai/cache-stats
 * Returns in-memory cache hit/miss statistics.
 */
export const getCacheStats = asyncHandler(async (req, res) => {
  const stats = aiService.getCacheStats();
  res.json({ success: true, data: stats });
});

/**
 * POST /api/ai/explain-recommendation
 * Grounded Recommendation Explainability Layer (Phase 5).
 *
 * Provides on-demand, factual verbalization of recommendation signals with strict grounding,
 * controlled vocabulary validation, multi-tenant cache isolation, and zero-LLM deterministic fallback.
 *
 * Body:
 * - movieId: string (required)
 * - contextType: 'personalized' | 'search' (required)
 * - query: string (required if contextType === 'search')
 */
export const explainRecommendation = asyncHandler(async (req, res) => {
  const { movieId, contextType, query } = req.body;

  if (!movieId || typeof movieId !== 'string' || !movieId.trim()) {
    throw new ApiError(400, 'Movie ID is required.');
  }

  if (!contextType || (contextType !== 'personalized' && contextType !== 'search')) {
    throw new ApiError(400, "contextType must be either 'personalized' or 'search'.");
  }

  if (contextType === 'personalized' && !req.user) {
    throw new ApiError(401, 'Authentication required for personalized recommendation explanation.');
  }

  if (contextType === 'search') {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new ApiError(400, "Search query is required when contextType is 'search'.");
    }
  }

  // Authoritative execution via ExplanationEngine
  const explanation = await explanationEngine.explainRecommendation({
    movieId: movieId.trim(),
    contextType,
    query: query ? query.trim() : '',
    user: req.user || null,
  });

  res.json({
    success: true,
    data: explanation,
  });
});

/**
 * GET /api/ai/taste-profile
 * On-demand, private, grounded AI Taste Profile (Phase 6).
 */
export const getTasteProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, 'Access denied. Authentication required.');
  }

  const result = await getTasteProfileForUser(req.user.id);

  res.json({
    success: true,
    profile: result.profile,
    summary: result.summary,
    data: {
      profile: result.profile,
      summary: result.summary,
    },
  });
});

