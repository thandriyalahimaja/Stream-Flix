/**
 * StreamFlix — Capstone-Grade Hybrid Recommendation Engine
 *
 * Implements a 5-pillar hybrid recommendation architecture:
 * 1. Semantic Similarity (Dual-Vector User Taste Profile vs Movie Embeddings)
 * 2. Behavioral Scoring (Preserved Baseline Genre-Frequency Signal)
 * 3. Structured Metadata Matching (Explicit Genres, Language, Director, Cast, Industry)
 * 4. Quality Scoring (Vote-Dampened Bayesian Ratings)
 * 5. Novelty & Exploration (Unseen High-Quality Catalog Discovery)
 *
 * Followed by Maximal Marginal Relevance (MMR) Diversity Reranking to eliminate
 * duplicate sequel clustering and balance catalogue representation.
 *
 * Zero AI API runtime dependency: normal recommendations run 100% locally in Node.js.
 */

import {
  movieVectorIndex,
  userVectorCache,
  buildUserTasteVectors,
  calculateSemanticScore,
  getSemanticCandidates,
  cosineSimilarity,
  isValidVector
} from './semanticRecommendationService.js';

// Centralized Hybrid Weight Configuration & Ablation Flags
export const DEFAULT_HYBRID_CONFIG = {
  // Weights (sum to 1.0)
  semanticWeight: 0.35,
  behaviorWeight: 0.25,
  metadataWeight: 0.15,
  qualityWeight: 0.15,
  noveltyWeight: 0.10,

  // Component Ablation Toggles
  enableSemantic: true,
  enableBehavior: true,
  enableMetadata: true,
  enableQuality: true,
  enableNovelty: true,
  enableDiversity: true,

  // Diversity & Funnel Settings
  mmrLambda: 0.70, // 0.70 relevance vs 0.30 diversity
  candidatePoolLimit: 50,
  finalRerankPoolLimit: 30,
  defaultReturnLimit: 12,

  // Exclusion Rules
  excludeDisliked: true,
  excludeLiked: true,
  excludeReviewed: true,
  excludeWatchedTrailers: false, // Don't exclude just because trailer was clicked
};

// ─── 1. Preserved Baseline Recommender ────────────────────────────────────────

/**
 * Build a genre frequency map from an array of movies.
 * Preserved identically from original baseline implementation.
 */
export function buildGenreFrequencyMap(movies) {
  const genreMap = {};
  movies.forEach((movie) => {
    if (!movie || !Array.isArray(movie.genres)) return;
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
 * Score a single candidate movie using original baseline rules.
 * Score = 2 * sum(userGenreFrequency) + (1 if rating >= 8.0).
 */
export function calculateBaselineBehaviorScore(candidateMovie, combinedGenreMap) {
  if (!candidateMovie || !Array.isArray(candidateMovie.genres)) return 0;
  let score = 0;
  const uniqueGenres = new Set(candidateMovie.genres.map(g => String(g).trim()));
  uniqueGenres.forEach((genre) => {
    if (combinedGenreMap[genre]) {
      score += 2 * combinedGenreMap[genre];
    }
  });
  if (candidateMovie.rating >= 8.0) {
    score += 1;
  }
  return score;
}

/**
 * Original baseline recommendation algorithm.
 * Preserved verbatim as an independently callable baseline and fallback.
 */
export function getBaselineRecommendations({
  preferredGenres = [],
  likedMovies = [],
  watchHistory = [],
  reviewedMovies = [],
  watchlistMovies = [],
  allMovies = [],
  limit = 12,
}) {
  if (!allMovies || allMovies.length === 0) return [];

  const reviewedMovieIds = new Set(
    reviewedMovies.filter(Boolean).map((m) => String(m._id || m))
  );
  const likedMovieIds = new Set(
    likedMovies.filter(Boolean).map((m) => String(m._id || m))
  );
  const seenMovieIds = new Set([...reviewedMovieIds, ...likedMovieIds]);

  const uniquePreferredGenres = Array.from(new Set(preferredGenres.filter(Boolean).map(g => String(g).trim())));
  const preferenceMovies = uniquePreferredGenres.map((genre) => ({ genres: [genre] }));
  const likedGenreMap = buildGenreFrequencyMap(likedMovies.filter(Boolean));

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

  const combinedGenreMap = {};
  Object.entries(reviewedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 5;
  });
  Object.entries(likedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 4;
  });
  Object.entries(watchlistGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 3;
  });
  Object.entries(watchedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + Math.min(count, 1) * 2;
  });
  Object.entries(preferenceGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 1;
  });

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

  const scoredMovies = allMovies
    .filter((movie) => !seenMovieIds.has(String(movie._id)))
    .map((movie) => ({
      movie,
      score: calculateBaselineBehaviorScore(movie, combinedGenreMap),
    }))
    .filter(({ score }) => score > 0);

  scoredMovies.sort((itemA, itemB) => {
    if (itemB.score !== itemA.score) return itemB.score - itemA.score;
    if (itemB.movie.rating !== itemA.movie.rating) return itemB.movie.rating - itemA.movie.rating;
    return String(itemA.movie._id).localeCompare(String(itemB.movie._id));
  });

  return scoredMovies.slice(0, limit).map(({ movie }) => movie);
}

// ─── 2. Language Normalization, Metadata & Quality Scoring Helpers ────────────

export const LANGUAGE_MAP = {
  telugu: 'te',
  te: 'te',
  tamil: 'ta',
  ta: 'ta',
  malayalam: 'ml',
  ml: 'ml',
  kannada: 'kn',
  kn: 'kn',
  hindi: 'hi',
  hi: 'hi',
  bengali: 'bn',
  bn: 'bn',
  marathi: 'mr',
  mr: 'mr',
  gujarati: 'gu',
  gu: 'gu',
  punjabi: 'pa',
  pa: 'pa',
  english: 'en',
  en: 'en',
};

export function normalizeLanguageCode(lang) {
  if (!lang || typeof lang !== 'string') return null;
  const clean = lang.trim().toLowerCase();
  if (LANGUAGE_MAP[clean]) return LANGUAGE_MAP[clean];
  for (const [k, v] of Object.entries(LANGUAGE_MAP)) {
    if (clean === k || clean.startsWith(k) || k.startsWith(clean)) return v;
  }
  return clean;
}

export function getMovieLanguage(movie) {
  if (!movie) return 'en';
  if (movie.language) return normalizeLanguageCode(movie.language);
  if (movie.languageName) return normalizeLanguageCode(movie.languageName);
  return 'en';
}

/**
 * Calculate vote-dampened Bayesian quality score.
 * Dampens ratings with low vote counts toward catalog mean to prevent inflation.
 * Normalized to [0.0, 1.0].
 */
export function calculateQualityScore(movie, minVotes = 500, priorRating = 7.0) {
  if (!movie) return 0.5;
  const rating = Number(movie.rating) || priorRating;
  const votes = Number(movie.voteCount) || 100;
  const bayesianRating = (votes / (votes + minVotes)) * rating + (minVotes / (votes + minVotes)) * priorRating;
  return parseFloat(Math.max(0, Math.min(1.0, bayesianRating / 10.0)).toFixed(4));
}

/**
 * Calculate structured metadata match score.
 * Evaluates explicit alignment with user's preferred / historical genres, language,
 * director, and cast.
 * Normalized to [0.0, 1.0].
 */
export function calculateMetadataScore(movie, userProfileContext = {}) {
  if (!movie) return 0;
  let score = 0;
  let maxPossible = 0;

  // 1. Genre alignment (Weight 4)
  const targetGenres = userProfileContext.preferredGenres || [];
  if (targetGenres.length > 0) {
    maxPossible += 4;
    if (Array.isArray(movie.genres)) {
      const movieGenres = movie.genres.map(g => String(g).trim().toLowerCase());
      const matchCount = targetGenres.filter(g => movieGenres.includes(String(g).trim().toLowerCase())).length;
      score += 4 * (matchCount / Math.max(1, targetGenres.length));
    }
  }

  // 2. Language alignment (Explicit preference: Weight 6; Dominant: Weight 2; Neutral: Weight 2)
  const prefLang = normalizeLanguageCode(userProfileContext.preferredLanguage);
  const movieLang = getMovieLanguage(movie);

  if (prefLang) {
    maxPossible += 6;
    if (movieLang === prefLang) {
      score += 6;
    }
  } else if (userProfileContext.dominantLanguage) {
    const dominant = normalizeLanguageCode(userProfileContext.dominantLanguage);
    maxPossible += 2;
    if (movieLang === dominant) {
      score += 2;
    } else {
      score += 0.5;
    }
  } else {
    maxPossible += 2;
    score += 1.0;
  }

  // 3. Director affinity (Weight 2)
  const favoriteDirectors = userProfileContext.favoriteDirectors || new Set();
  if (favoriteDirectors.size > 0) {
    maxPossible += 2;
    if (movie.director && favoriteDirectors.has(movie.director.trim().toLowerCase())) {
      score += 2;
    }
  }

  // 4. Cast affinity (Weight 1)
  const favoriteActors = userProfileContext.favoriteActors || new Set();
  if (favoriteActors.size > 0) {
    maxPossible += 1;
    if (Array.isArray(movie.cast)) {
      const actorMatch = movie.cast.some(a => favoriteActors.has(String(a).trim().toLowerCase()));
      if (actorMatch) score += 1;
    }
  }

  if (maxPossible === 0) return 0.5;
  return parseFloat((score / maxPossible).toFixed(4));
}

// ─── 3. Maximal Marginal Relevance (MMR) Diversity Reranking ───────────────────

/**
 * Re-rank candidate items using Maximal Marginal Relevance (MMR)
 * MMR = lambda * Relevance(m) - (1 - lambda) * max_{s in Selected} Similarity(m, s)
 *
 * @param {Object[]} candidates - Array of scored candidates with { movie, hybridScore }
 * @param {number} [limit=12] - Number of items to select
 * @param {number} [lambda=0.70] - Balance between relevance (1.0) and diversity (0.0)
 * @returns {Object[]} - Re-ranked selected items
 */
export function applyMMRDiversity(candidates, limit = 12, lambda = 0.70) {
  if (!candidates || candidates.length === 0) return [];
  if (candidates.length <= limit) return candidates;

  const selected = [];
  const remaining = [...candidates];

  // Helper to compute inter-movie similarity (vector cosine if both have embeddings, else genre Jaccard)
  function computeItemSimilarity(itemA, itemB) {
    const movieA = itemA.movie;
    const movieB = itemB.movie;

    let sim = 0;
    // 1. Vector cosine similarity if both embeddings are valid
    if (movieA.embedding && movieB.embedding && isValidVector(movieA.embedding) && isValidVector(movieB.embedding)) {
      const cos = cosineSimilarity(movieA.embedding, movieB.embedding);
      sim = Math.max(0, (cos + 1) / 2);
    } else {
      // 2. Fallback: Genre Jaccard similarity
      const setA = new Set((movieA.genres || []).map(g => String(g).toLowerCase()));
      const setB = new Set((movieB.genres || []).map(g => String(g).toLowerCase()));
      const intersection = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...setA, ...setB]).size;
      sim = union > 0 ? intersection / union : 0;
    }

    // 3. Language similarity: if both share the same language, increase similarity (+0.20)
    // to promote multi-language catalog diversity across recommendations
    const langA = getMovieLanguage(movieA);
    const langB = getMovieLanguage(movieB);
    if (langA && langB && langA === langB) {
      sim = Math.min(1.0, sim + 0.20);
    }

    // 4. Director / franchise duplicate boost
    const sameDirector = movieA.director && movieB.director && movieA.director.toLowerCase() === movieB.director.toLowerCase();
    if (sameDirector) {
      sim = Math.min(1.0, sim + 0.25);
    }

    return sim;
  }

  // First item is always the top hybrid score
  const first = remaining.shift();
  first.mmrScore = first.hybridScore;
  selected.push(first);

  while (selected.length < limit && remaining.length > 0) {
    let bestIdx = -1;
    let bestMmr = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const relevance = candidate.hybridScore;

      // Find max similarity to any already selected movie
      let maxSimToSelected = 0;
      for (let s = 0; s < selected.length; s++) {
        const sim = computeItemSimilarity(candidate, selected[s]);
        if (sim > maxSimToSelected) maxSimToSelected = sim;
      }

      const mmr = lambda * relevance - (1 - lambda) * maxSimToSelected;

      if (mmr > bestMmr) {
        bestMmr = mmr;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      const chosen = remaining.splice(bestIdx, 1)[0];
      chosen.mmrScore = parseFloat(bestMmr.toFixed(4));
      selected.push(chosen);
    } else {
      break;
    }
  }

  return selected;
}

// ─── 4. Main Hybrid Recommendation Pipeline ───────────────────────────────────

/**
 * Generate Capstone-Grade Hybrid Movie Recommendations.
 *
 * Execution Order:
 * 1. Build & cache user taste vectors (positive & negative spaces).
 * 2. Multi-Channel Candidate Generation (Semantic, Baseline, Metadata, Quality/Exploration).
 * 3. Candidate Pool Union & Source Channel Annotation.
 * 4. 5-Pillar Hybrid Scoring with missing-embedding re-weighting.
 * 5. Top 30 candidate funneling.
 * 6. Maximal Marginal Relevance (MMR) Diversity Reranking.
 * 7. Return Top 12 (or requested limit) with optional debug diagnostics.
 *
 * @param {Object} params
 * @param {string} [params.userId] - User ID for taste vector caching
 * @param {string[]} [params.preferredGenres=[]]
 * @param {string} [params.preferredLanguage]
 * @param {Object[]} [params.likedMovies=[]]
 * @param {Object[]} [params.dislikedMovies=[]]
 * @param {Object[]} [params.userReviews=[]]
 * @param {Object[]} [params.watchlistMovies=[]]
 * @param {Object[]} [params.watchHistory=[]]
 * @param {Object[]} [params.allMovies=[]]
 * @param {number} [params.limit=12]
 * @param {Object} [params.customConfig={}] - Overrides for weights and ablation
 * @param {boolean} [params.includeDebug=false] - Attach debug diagnostic breakdown
 * @returns {Object[]} - Array of recommended Movie objects (with optional _debug property)
 */
export function getRecommendations({
  userId = null,
  preferredGenres = [],
  preferredLanguage = null,
  likedMovies = [],
  dislikedMovies = [],
  userReviews = [],
  watchlistMovies = [],
  watchHistory = [],
  allMovies = [],
  limit = 12,
  customConfig = {},
  includeDebug = false,
} = {}) {
  const cfg = { ...DEFAULT_HYBRID_CONFIG, ...customConfig };

  if (!allMovies || allMovies.length === 0) return [];

  // Ensure in-memory vector index is populated
  if (movieVectorIndex.size() === 0) {
    movieVectorIndex.indexMovies(allMovies);
  }

  // 1. Construct Exclusions Set
  const excludedIds = new Set();

  if (cfg.excludeDisliked) {
    dislikedMovies.forEach(m => m && excludedIds.add(String(m._id || m)));
  }
  if (cfg.excludeLiked) {
    likedMovies.forEach(m => m && excludedIds.add(String(m._id || m)));
  }
  if (cfg.excludeReviewed) {
    userReviews.forEach(r => r && r.movie && excludedIds.add(String(r.movie._id || r.movie)));
  }
  if (cfg.excludeWatchedTrailers) {
    watchHistory.forEach(w => w && w.movie && excludedIds.add(String(w.movie._id || w.movie)));
  }

  // Filter out invalid/excluded movies from catalog
  const eligibleMovies = allMovies.filter(m => m && !excludedIds.has(String(m._id)));
  if (eligibleMovies.length === 0) return [];

  // 2. Build or Retrieve User Taste Profile Vectors
  let userVectors = null;
  if (userId) userVectors = userVectorCache.get(userId);

  if (!userVectors) {
    userVectors = buildUserTasteVectors({
      likedMovies,
      dislikedMovies,
      userReviews,
      watchlistMovies,
      trailerHistory: watchHistory,
    });
    if (userId && userVectors.hasVectors) {
      userVectorCache.set(userId, userVectors);
    }
  }

  const { positiveUserVector, negativeUserVector } = userVectors;

  // Build Context for Metadata & Baseline Scoring
  const uniquePreferredGenres = Array.from(new Set(preferredGenres.filter(Boolean).map(g => String(g).trim())));
  const preferenceMovies = uniquePreferredGenres.map(g => ({ genres: [g] }));
  const likedGenreMap = buildGenreFrequencyMap(likedMovies.filter(Boolean));

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
  const reviewedGenreMap = buildGenreFrequencyMap(userReviews.map(r => r.movie).filter(Boolean));
  const watchlistGenreMap = buildGenreFrequencyMap(watchlistMovies.map(w => w.movie || w).filter(Boolean));
  const preferenceGenreMap = buildGenreFrequencyMap(preferenceMovies);

  const combinedGenreMap = {};
  Object.entries(reviewedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 5;
  });
  Object.entries(likedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 4;
  });
  Object.entries(watchlistGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 3;
  });
  Object.entries(watchedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + Math.min(count, 1) * 2;
  });
  Object.entries(preferenceGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 1;
  });

  // Extract Favorite Directors and Cast from highly rated/liked films
  const favoriteDirectors = new Set();
  const favoriteActors = new Set();
  const likedAndGood = [
    ...likedMovies,
    ...userReviews.filter(r => Number(r.rating) >= 7).map(r => r.movie)
  ].filter(Boolean);

  likedAndGood.forEach(m => {
    if (m.director) favoriteDirectors.add(m.director.trim().toLowerCase());
    if (Array.isArray(m.cast)) {
      m.cast.forEach(a => favoriteActors.add(String(a).trim().toLowerCase()));
    }
  });

  // Determine dominant interacted language
  const langCount = {};
  likedAndGood.forEach(m => {
    const lang = m.language || m.languageName;
    if (lang) langCount[lang] = (langCount[lang] || 0) + 1;
  });
  let dominantLanguage = null;
  let maxLangCount = 0;
  Object.entries(langCount).forEach(([lang, cnt]) => {
    if (cnt > maxLangCount) {
      maxLangCount = cnt;
      dominantLanguage = lang;
    }
  });

  const metadataContext = {
    preferredGenres: uniquePreferredGenres,
    preferredLanguage,
    dominantLanguage,
    favoriteDirectors,
    favoriteActors,
  };

  // 3. Multi-Channel Candidate Generation
  const candidatePool = new Map(); // movieId -> { movie, channels: Set }

  function addCandidate(movie, channel) {
    if (!movie) return;
    const mid = String(movie._id);
    if (excludedIds.has(mid)) return;

    if (!candidatePool.has(mid)) {
      candidatePool.set(mid, { movie, channels: new Set([channel]) });
    } else {
      candidatePool.get(mid).channels.add(channel);
    }
  }

  // Channel A: Semantic Candidates (Top 50)
  if (cfg.enableSemantic && positiveUserVector) {
    const semanticHits = getSemanticCandidates({
      positiveUserVector,
      negativeUserVector,
      excludedIds,
      limit: cfg.candidatePoolLimit,
    });
    semanticHits.forEach(hit => {
      const movieDoc = eligibleMovies.find(m => String(m._id) === hit.movieId);
      if (movieDoc) addCandidate(movieDoc, 'semantic');
    });
  }

  // Channel B: Baseline Candidates (Top 50)
  if (cfg.enableBehavior && Object.keys(combinedGenreMap).length > 0) {
    const baselineScored = eligibleMovies
      .map(m => ({ movie: m, score: calculateBaselineBehaviorScore(m, combinedGenreMap) }))
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.movie.rating || 0) - (a.movie.rating || 0);
      })
      .slice(0, cfg.candidatePoolLimit);

    baselineScored.forEach(x => addCandidate(x.movie, 'baseline'));
  }

  // Channel C: Metadata Candidates (Top 50 by explicit alignment)
  if (cfg.enableMetadata) {
    const metadataScored = eligibleMovies
      .map(m => ({ movie: m, score: calculateMetadataScore(m, metadataContext) }))
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.movie.rating || 0) - (a.movie.rating || 0);
      })
      .slice(0, cfg.candidatePoolLimit);

    metadataScored.forEach(x => addCandidate(x.movie, 'metadata'));
  }

  // Channel D: Quality & Exploration Candidates (Top 20 high-quality discovery)
  if (cfg.enableQuality || cfg.enableNovelty) {
    const qualityScored = eligibleMovies
      .map(m => ({ movie: m, score: calculateQualityScore(m) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    qualityScored.forEach(x => addCandidate(x.movie, 'quality'));
  }

  // Fallback if candidate pool is empty (e.g. brand new user with no signals)
  if (candidatePool.size === 0) {
    eligibleMovies
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, cfg.candidatePoolLimit)
      .forEach(m => addCandidate(m, 'fallback'));
  }

  // 4. Five-Pillar Hybrid Scoring
  const candidatesArray = Array.from(candidatePool.values());

  // Find max baseline behavior score in the candidate set for normalization to [0, 1]
  let maxBehaviorRaw = 1;
  candidatesArray.forEach(({ movie }) => {
    const raw = calculateBaselineBehaviorScore(movie, combinedGenreMap);
    if (raw > maxBehaviorRaw) maxBehaviorRaw = raw;
  });

  const scoredCandidates = candidatesArray.map(({ movie, channels }) => {
    // 1. Semantic score
    let semanticScore = null;
    const hasEmbedding = movie.embedding && isValidVector(movie.embedding);
    if (cfg.enableSemantic && hasEmbedding && positiveUserVector) {
      semanticScore = calculateSemanticScore(movie.embedding, positiveUserVector, negativeUserVector);
    }

    // 2. Behavior score (normalized)
    const rawBehavior = calculateBaselineBehaviorScore(movie, combinedGenreMap);
    const behaviorScore = cfg.enableBehavior ? parseFloat((rawBehavior / maxBehaviorRaw).toFixed(4)) : 0;

    // 3. Metadata score (normalized)
    const metadataScore = cfg.enableMetadata ? calculateMetadataScore(movie, metadataContext) : 0;

    // 4. Quality score (vote-dampened)
    const qualityScore = cfg.enableQuality ? calculateQualityScore(movie) : 0;

    // 5. Novelty score (inverse of catalog view count to reward undiscovered gems)
    const views = Number(movie.views) || 0;
    const noveltyScore = cfg.enableNovelty ? parseFloat((1 / (1 + Math.log10(1 + views))).toFixed(4)) : 0;

    // Handle missing embedding with dynamic weight renormalization
    let wSem = cfg.enableSemantic && semanticScore !== null ? cfg.semanticWeight : 0;
    let wBeh = cfg.enableBehavior ? cfg.behaviorWeight : 0;
    let wMet = cfg.enableMetadata ? cfg.metadataWeight : 0;
    let wQua = cfg.enableQuality ? cfg.qualityWeight : 0;
    let wNov = cfg.enableNovelty ? cfg.noveltyWeight : 0;

    const totalWeight = wSem + wBeh + wMet + wQua + wNov;
    let hybridScore = 0;

    if (totalWeight > 0) {
      hybridScore =
        ((semanticScore !== null ? semanticScore : 0) * wSem +
          behaviorScore * wBeh +
          metadataScore * wMet +
          qualityScore * wQua +
          noveltyScore * wNov) /
        totalWeight;
    } else {
      hybridScore = qualityScore;
    }

    hybridScore = parseFloat(hybridScore.toFixed(4));

    // Prepare diagnostic debug payload
    const debugInfo = {
      movieId: String(movie._id),
      title: movie.title,
      year: movie.year,
      language: getMovieLanguage(movie),
      semanticScore,
      behaviorScore,
      metadataScore,
      qualityScore,
      noveltyScore,
      hybridScore,
      candidateSources: Array.from(channels),
      embeddingAvailable: hasEmbedding,
      matchedGenres: (movie.genres || []).filter(g => (uniquePreferredGenres || []).includes(g)),
      matchedLanguage: Boolean(preferredLanguage && normalizeLanguageCode(preferredLanguage) === getMovieLanguage(movie)),
      matchedDirector: movie.director && favoriteDirectors.has(movie.director.trim().toLowerCase()),
      matchedActors: (movie.cast || []).filter(a => favoriteActors.has(String(a).trim().toLowerCase())),
    };

    return {
      movie,
      hybridScore,
      debugInfo,
    };
  });

  // Sort candidates by hybrid score descending
  scoredCandidates.sort((a, b) => {
    if (b.hybridScore !== a.hybridScore) return b.hybridScore - a.hybridScore;
    return (b.movie.rating || 0) - (a.movie.rating || 0);
  });

  // Funnel to top 30 candidates for MMR
  const top30Pool = scoredCandidates.slice(0, cfg.finalRerankPoolLimit);

  // 5. Apply MMR Diversity Reranking
  let finalSelected = top30Pool;
  if (cfg.enableDiversity) {
    finalSelected = applyMMRDiversity(top30Pool, limit, cfg.mmrLambda);
  } else {
    finalSelected = top30Pool.slice(0, limit);
  }

  // 6. Format Return Value
  return finalSelected.map(item => {
    const movieObj = item.movie.toObject ? item.movie.toObject() : { ...item.movie };
    if (!movieObj.language) {
      movieObj.language = getMovieLanguage(movieObj);
    }
    if (includeDebug) {
      // Attach debug property to movie doc
      movieObj._debug = {
        ...item.debugInfo,
        mmrScore: item.mmrScore ?? item.hybridScore,
      };
    }
    return movieObj;
  });
}

/**
 * Find movies similar to a reference movie ("More Like This").
 * Upgraded to use semantic similarity when embeddings are present,
 * with graceful fallback to shared genres and rating.
 */
export function getSimilarMovies(movieId, allMovies, limit = 6) {
  if (!allMovies || allMovies.length === 0) return [];
  const refId = String(movieId);
  const refMovie = allMovies.find(m => String(m._id) === refId);
  if (!refMovie) return [];

  // Check if reference movie has vector embedding
  if (refMovie.embedding && isValidVector(refMovie.embedding)) {
    const candidates = allMovies
      .filter(m => String(m._id) !== refId && m.embedding && isValidVector(m.embedding))
      .map(m => ({
        movie: m,
        similarity: cosineSimilarity(refMovie.embedding, m.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    if (candidates.length >= limit) {
      return candidates.slice(0, limit).map(c => c.movie);
    }
  }

  // Fallback to genre overlap and rating
  return allMovies
    .filter(
      (m) =>
        String(m._id) !== refId &&
        Array.isArray(m.genres) &&
        Array.isArray(refMovie.genres) &&
        m.genres.some((genre) => refMovie.genres.includes(genre))
    )
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}
