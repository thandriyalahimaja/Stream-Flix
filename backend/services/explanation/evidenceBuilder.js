import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Movie from '../../models/Movie.js';
import User from '../../models/User.js';
import Review from '../../models/Review.js';
import Watchlist from '../../models/Watchlist.js';
import { aiService } from '../ai/aiService.js';
import { formatLanguage } from './explanationTemplates.js';

function sha256(str) {
  return crypto.createHash('sha256').update(String(str || '')).digest('hex');
}

/**
 * Normalizes movie document or plain object into standard structure.
 */
function normalizeMovieDoc(movie) {
  if (!movie) return null;
  const doc = movie.toObject ? movie.toObject() : movie;
  return {
    _id: String(doc._id || doc.id || ''),
    title: String(doc.title || ''),
    genres: Array.isArray(doc.genres) ? doc.genres.map(g => String(g).trim()).filter(Boolean) : [],
    language: String(doc.language || 'en').toLowerCase().trim(),
    rating: typeof doc.rating === 'number' ? doc.rating : parseFloat(doc.rating || 0),
    runtime: typeof doc.runtime === 'number' ? doc.runtime : (parseInt(doc.runtime, 10) || null),
    director: doc.director ? String(doc.director).trim() : null,
    cast: Array.isArray(doc.cast) ? doc.cast.map(c => String(c).trim()).filter(Boolean) : [],
    year: doc.year || null,
    views: Number(doc.views) || 0,
    themes: Array.isArray(doc.themes) ? doc.themes.map(t => String(t).trim()).filter(Boolean) : [],
    moods: Array.isArray(doc.moods) ? doc.moods.map(m => String(m).trim()).filter(Boolean) : [],
    synopsis: doc.description || doc.synopsis || '',
    embedding: doc.embedding || null,
  };
}

/**
 * Authoritative Evidence Builder (R1)
 *
 * Reconstructs verified, factual evidence directly from the database and recommender signals.
 * Guarantees:
 * 1. Zero score leakage: Strips all internal continuous weights (semanticScore, hybridScore, qualityScore, noveltyScore).
 * 2. Immutability: Pure read-only operation; recommender ranking and state are unchanged.
 * 3. Client claim rejection: Completely ignores any client-supplied scores, claims, or evidence text.
 * 4. Controlled chip vocabulary: Builds an authoritative whitelist of chips derived exclusively from verified matches.
 */
export class EvidenceBuilder {
  /**
   * Builds authoritative factual evidence for an explanation request.
   *
   * @param {Object} params
   * @param {string|Object} params.movie - Movie ID or pre-loaded Movie object
   * @param {string} [params.contextType='personalized'] - 'personalized' | 'search'
   * @param {string} [params.query] - Natural language search query
   * @param {string|Object} [params.user] - User ID or Authenticated user object
   * @param {Object} [params.intent] - Pre-extracted search intent (optional)
   * @param {Object} [params.recommenderSignals] - Diagnostic signals from recommender (optional)
   * @returns {Promise<Object>} Authoritative Evidence Object
   */
  async buildEvidence({
    movie,
    contextType = 'personalized',
    query = '',
    user = null,
    intent = null,
    recommenderSignals = null,
  }) {
    // 1. Authoritative Movie Resolution
    let movieDoc = null;
    if (movie && typeof movie === 'object' && (movie._id || movie.id || movie.title)) {
      movieDoc = normalizeMovieDoc(movie);
    } else if (movie && typeof movie === 'string') {
      const found = await Movie.findById(movie).lean();
      if (found) movieDoc = normalizeMovieDoc(found);
    }

    if (!movieDoc) {
      throw new Error(`Movie not found for ID: ${movie}`);
    }

    // 2. Branch by contextType
    if (contextType === 'search') {
      return this._buildSearchEvidence({ movieDoc, query, intent, recommenderSignals });
    }

    return this._buildPersonalizedEvidence({ movieDoc, user, recommenderSignals });
  }

  /**
   * Construct factual evidence for Personalized Recommendation.
   */
  async _buildPersonalizedEvidence({ movieDoc, user, recommenderSignals }) {
    let userDoc = null;
    let likedMovies = [];
    let dislikedMovies = [];
    let userReviews = [];
    let watchlistMovies = [];
    let watchHistory = [];

    const userId = user?.id || user?._id || (typeof user === 'string' ? user : null);

    const hasPopulatedFields = user && typeof user === 'object' && (user.likedMovies || user.preferences || user.dislikedMovies);

    if (userId && !hasPopulatedFields && mongoose.isValidObjectId(userId)) {
      const [u, revs, wl] = await Promise.all([
        User.findById(userId)
          .populate('likedMovies', 'genres rating director cast language _id')
          .populate('dislikedMovies', 'genres rating director cast language _id')
          .populate('trailerHistory.movie', 'genres rating director cast language _id')
          .lean(),
        Review.find({ user: userId })
          .populate('movie', 'genres rating director cast language _id')
          .lean(),
        Watchlist.find({ user: userId })
          .populate('movie', 'genres rating director cast language _id')
          .lean(),
      ]);

      userDoc = u;
      if (u) {
        likedMovies = (u.likedMovies || []).filter(Boolean);
        dislikedMovies = (u.dislikedMovies || []).filter(Boolean);
        watchHistory = (u.trailerHistory || []).filter(h => h && h.movie);
      }
      userReviews = (revs || []).filter(r => r && r.movie);
      watchlistMovies = (wl || []).map(w => w.movie).filter(Boolean);
    } else if (user && typeof user === 'object') {
      userDoc = user;
      likedMovies = user.likedMovies || [];
      dislikedMovies = user.dislikedMovies || [];
      userReviews = user.userReviews || [];
      watchlistMovies = user.watchlistMovies || [];
      watchHistory = user.watchHistory || [];
    }

    // Derive verified user preferences
    const preferredGenresSet = new Set([
      ...(userDoc?.preferredGenres || []).map(g => String(g).trim().toLowerCase()),
      ...likedMovies.flatMap(m => (m.genres || []).map(g => String(g).trim().toLowerCase())),
      ...userReviews.filter(r => (r.rating || 0) >= 7).flatMap(r => (r.movie?.genres || []).map(g => String(g).trim().toLowerCase())),
    ]);

    const preferredLanguagesSet = new Set([
      ...(userDoc?.preferredLanguages || []).map(l => String(l).trim().toLowerCase()),
      ...likedMovies.map(m => String(m.language || '').trim().toLowerCase()).filter(Boolean),
    ]);

    const favoriteDirectorsSet = new Set([
      ...likedMovies.map(m => String(m.director || '').trim().toLowerCase()).filter(Boolean),
      ...userReviews.filter(r => (r.rating || 0) >= 8).map(r => String(r.movie?.director || '').trim().toLowerCase()).filter(Boolean),
    ]);

    const favoriteActorsSet = new Set([
      ...likedMovies.flatMap(m => (m.cast || []).map(a => String(a).trim().toLowerCase())),
      ...userReviews.filter(r => (r.rating || 0) >= 8).flatMap(r => (r.movie?.cast || []).map(a => String(a).trim().toLowerCase())),
    ]);

    // Factual Match Calculations
    const matchedGenres = movieDoc.genres.filter(g => preferredGenresSet.has(g.toLowerCase()));

    const matchedLanguages = [];
    if (movieDoc.language && preferredLanguagesSet.has(movieDoc.language.toLowerCase())) {
      matchedLanguages.push(movieDoc.language);
    }

    let matchedDirector = null;
    if (movieDoc.director && favoriteDirectorsSet.has(movieDoc.director.toLowerCase())) {
      matchedDirector = movieDoc.director;
    }

    const matchedActors = movieDoc.cast.filter(a => favoriteActorsSet.has(a.toLowerCase()));

    // Quality signal (public rating, not internal quality weight)
    const isHighRated = movieDoc.rating >= 7.5;
    const qualitySignal = {
      isHighRated,
      rating: movieDoc.rating,
    };

    // Novelty signal (unseen gem indicator)
    const isDiscoveryGem = movieDoc.views < 500 && movieDoc.rating >= 7.0;
    const noveltySignal = {
      isDiscoveryGem,
    };

    // Semantic match indicator (categorical/boolean only, no continuous score)
    const semanticMatch = Boolean(
      recommenderSignals?.semanticMatch !== undefined
        ? recommenderSignals.semanticMatch
        : (recommenderSignals?.semanticScore !== undefined
            ? recommenderSignals.semanticScore >= 0.55
            : (matchedGenres.length > 0 || matchedLanguages.length > 0))
    );

    // Build Controlled Chip Vocabulary (authoritative whitelist)
    const chipSet = new Set();
    matchedGenres.forEach(g => chipSet.add(g));
    if (matchedLanguages.length > 0) {
      const formatted = formatLanguage(matchedLanguages[0]);
      if (formatted) chipSet.add(formatted);
    }
    if (matchedDirector) chipSet.add(`Dir: ${matchedDirector}`);
    if (matchedActors.length > 0) chipSet.add(matchedActors[0]);
    if (isHighRated) chipSet.add('Critically Acclaimed');
    if (isDiscoveryGem) chipSet.add('Hidden Gem');
    if (movieDoc.themes?.length > 0) chipSet.add(movieDoc.themes[0]);

    // Calculate deterministic context hashes for cache isolation
    const userGenreList = Array.from(preferredGenresSet).sort().join(',');
    const likedList = likedMovies.map(m => String(m._id || m)).sort().join(',');
    const userContextHash = sha256(`${userId || 'anonymous'}:${userGenreList}:${likedList}`);
    const recContextHash = sha256(`${matchedGenres.sort().join(',')}:${matchedLanguages.sort().join(',')}`);

    return {
      movieId: movieDoc._id,
      movieTitle: movieDoc.title,
      year: movieDoc.year,
      contextType: 'personalized',
      matchedGenres,
      matchedLanguages,
      matchedThemes: [],
      matchedMoods: [],
      matchedDirector,
      matchedActors,
      runtimeMatch: null,
      qualitySignal,
      noveltySignal,
      semanticMatch,
      referenceMovie: null,
      controlledChipVocabulary: Array.from(chipSet),
      userContextHash,
      recContextHash,
    };
  }

  /**
   * Construct factual evidence for Search Recommendation.
   */
  async _buildSearchEvidence({ movieDoc, query, intent, recommenderSignals }) {
    const cleanQuery = String(query || '').trim();

    // 1. Resolve search intent if not provided
    let normalizedIntent = intent;
    if (!normalizedIntent && cleanQuery) {
      const intentRes = await aiService.extractMovieIntent(cleanQuery);
      normalizedIntent = intentRes.normalizedIntent || {};
    }
    normalizedIntent = normalizedIntent || {};

    const intentGenres = (normalizedIntent.genres || []).map(g => String(g).trim().toLowerCase());
    const intentLanguages = (normalizedIntent.languages || []).map(l => String(l).trim().toLowerCase());
    const intentThemes = (normalizedIntent.themes || []).map(t => String(t).trim().toLowerCase());
    const intentMoods = (normalizedIntent.moods || []).map(m => String(m).trim().toLowerCase());

    // Factual Match Calculations
    const matchedGenres = movieDoc.genres.filter(g => intentGenres.includes(g.toLowerCase()));

    const matchedLanguages = [];
    if (movieDoc.language && intentLanguages.includes(movieDoc.language.toLowerCase())) {
      matchedLanguages.push(movieDoc.language);
    }

    const matchedThemes = (movieDoc.themes || []).filter(t =>
      intentThemes.includes(t.toLowerCase()) || cleanQuery.toLowerCase().includes(t.toLowerCase())
    );

    const matchedMoods = (movieDoc.moods || []).filter(m =>
      intentMoods.includes(m.toLowerCase()) || cleanQuery.toLowerCase().includes(m.toLowerCase())
    );

    let matchedDirector = null;
    if (normalizedIntent.director && movieDoc.director) {
      if (movieDoc.director.toLowerCase().includes(normalizedIntent.director.toLowerCase())) {
        matchedDirector = movieDoc.director;
      }
    }

    const matchedActors = [];
    if (Array.isArray(normalizedIntent.actors)) {
      normalizedIntent.actors.forEach(actor => {
        const found = movieDoc.cast.find(c => c.toLowerCase().includes(actor.toLowerCase()));
        if (found) matchedActors.push(found);
      });
    }

    // Reference movie match
    let referenceMovie = normalizedIntent.referenceMovie ||
      (Array.isArray(normalizedIntent.referenceMovies) && normalizedIntent.referenceMovies.length > 0
        ? normalizedIntent.referenceMovies[0]
        : null);

    // Runtime match
    let runtimeMatch = null;
    if (normalizedIntent.runtimeMax && movieDoc.runtime) {
      if (movieDoc.runtime <= normalizedIntent.runtimeMax) {
        runtimeMatch = `${movieDoc.runtime}m (under ${normalizedIntent.runtimeMax}m)`;
      }
    } else if (movieDoc.runtime && (cleanQuery.includes('short') || cleanQuery.includes('quick'))) {
      if (movieDoc.runtime <= 105) runtimeMatch = `${movieDoc.runtime}m`;
    }

    // Quality signal
    const isHighRated = movieDoc.rating >= 7.5;
    const qualitySignal = {
      isHighRated,
      rating: movieDoc.rating,
    };

    const isDiscoveryGem = movieDoc.views < 500 && movieDoc.rating >= 7.0;
    const noveltySignal = {
      isDiscoveryGem,
    };

    // Semantic match indicator (categorical boolean only)
    const semanticMatch = Boolean(
      recommenderSignals?.semanticMatch !== undefined
        ? recommenderSignals.semanticMatch
        : (recommenderSignals?.semanticQueryScore !== undefined
            ? recommenderSignals.semanticQueryScore >= 0.50
            : (matchedGenres.length > 0 || matchedThemes.length > 0 || cleanQuery.length > 0))
    );

    // Build Controlled Chip Vocabulary (authoritative whitelist)
    const chipSet = new Set();
    matchedGenres.forEach(g => chipSet.add(g));
    if (matchedLanguages.length > 0) {
      const formatted = formatLanguage(matchedLanguages[0]);
      if (formatted) chipSet.add(formatted);
    }
    matchedThemes.forEach(t => chipSet.add(t.charAt(0).toUpperCase() + t.slice(1)));
    matchedMoods.forEach(m => chipSet.add(m.charAt(0).toUpperCase() + m.slice(1)));
    if (referenceMovie) chipSet.add(`Like ${referenceMovie}`);
    if (matchedDirector) chipSet.add(`Dir: ${matchedDirector}`);
    if (matchedActors.length > 0) chipSet.add(matchedActors[0]);
    if (isHighRated) chipSet.add('Critically Acclaimed');
    if (runtimeMatch) chipSet.add('Ideal Runtime');

    return {
      movieId: movieDoc._id,
      movieTitle: movieDoc.title,
      year: movieDoc.year,
      contextType: 'search',
      matchedGenres,
      matchedLanguages,
      matchedThemes,
      matchedMoods,
      matchedDirector,
      matchedActors,
      runtimeMatch,
      qualitySignal,
      noveltySignal,
      semanticMatch,
      referenceMovie,
      controlledChipVocabulary: Array.from(chipSet),
    };
  }
}

export const evidenceBuilder = new EvidenceBuilder();
