/**
 * StreamFlix — Semantic Recommendation Service
 *
 * Implements in-memory vector indexing, cosine similarity scoring,
 * dual-vector user taste modeling (positive and negative preference spaces),
 * configurable exponential time-decay weighting, and caching.
 *
 * Designed for capstone-grade hybrid recommendation without external vector DBs.
 */

// Model specifications
export const SUPPORTED_EMBEDDING_SPECS = {
  model: 'gemini-embedding-2-preview',
  dimensions: 768,
  version: 'phase3-v1',
};

// Default configurable interaction weights
export const DEFAULT_INTERACTION_WEIGHTS = {
  reviewHigh: 1.0,      // Rating 9-10
  reviewGood: 0.7,      // Rating 7-8
  reviewMixed: 0.2,     // Rating 5-6
  reviewNegative: 0.6,  // Rating 1-4 (enters negative channel)
  like: 0.8,            // Explicit like
  dislike: 0.8,         // Explicit dislike (enters negative channel)
  watchlist: 0.5,       // Saved to watchlist
  trailerHistory: 0.15, // Trailer started (weak engagement)
  trailerMaxPerMovie: 2,// Capped to avoid skew
  negativePenalty: 0.5, // Subtractive influence of negative vector
  halfLifeDays: 30,     // Time-decay half-life in days
};

/**
 * Compute exponential time decay factor.
 * decay = exp(-lambda * deltaDays), where lambda = ln(2) / halfLifeDays.
 *
 * @param {Date|string|number} eventDate - Timestamp of interaction
 * @param {number} [halfLifeDays=30] - Configurable half-life
 * @returns {number} - Decay factor in range (0.0, 1.0]
 */
export function computeTimeDecay(eventDate, halfLifeDays = 30) {
  if (!eventDate) return 1.0;
  const now = Date.now();
  const past = new Date(eventDate).getTime();
  if (isNaN(past) || past > now) return 1.0;
  const deltaDays = Math.max(0, (now - past) / (1000 * 60 * 60 * 24));
  const lambda = Math.LN2 / Math.max(1, halfLifeDays);
  return Math.exp(-lambda * deltaDays);
}

/**
 * Validate a vector against dimensions and numerical soundness.
 *
 * @param {number[]} vec
 * @param {number} [expectedDim=768]
 * @returns {boolean}
 */
export function isValidVector(vec, expectedDim = 768) {
  if (!Array.isArray(vec) || vec.length !== expectedDim) return false;
  for (let i = 0; i < vec.length; i++) {
    const val = vec[i];
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return false;
  }
  return true;
}

/**
 * Compute Euclidean L2 norm of a vector.
 *
 * @param {number[]} vec
 * @returns {number}
 */
export function computeL2Norm(vec) {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) sumSq += vec[i] * vec[i];
  return Math.sqrt(sumSq);
}

/**
 * Normalize vector to unit length (L2 norm = 1.0).
 * Returns null if vector is all zeros or empty.
 *
 * @param {number[]} vec
 * @returns {number[]|null}
 */
export function normalizeVector(vec) {
  if (!vec || vec.length === 0) return null;
  const norm = computeL2Norm(vec);
  if (norm === 0 || !isFinite(norm)) return null;
  const result = new Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    result[i] = vec[i] / norm;
  }
  return result;
}

/**
 * Compute Cosine Similarity between two vectors.
 * If vectors are already unit-normalized, this simplifies to the dot product.
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} - Similarity score in [-1.0, 1.0]
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory catalog vector cache
class MovieVectorIndex {
  constructor() {
    this.vectors = new Map(); // movieId -> { embedding, metadata, model, dimensions, version }
    this.lastIndexedAt = null;
  }

  /**
   * Load or refresh vectors into the in-memory cache.
   *
   * @param {Object[]} movies - Array of Movie documents
   */
  indexMovies(movies) {
    let indexedCount = 0;
    this.vectors.clear();

    for (const m of movies) {
      if (!m || !m.embedding) continue;
      if (isValidVector(m.embedding, SUPPORTED_EMBEDDING_SPECS.dimensions)) {
        const idStr = String(m._id || m.id);
        this.vectors.set(idStr, {
          movieId: idStr,
          title: m.title,
          year: m.year,
          language: m.language,
          genres: m.genres || [],
          embedding: m.embedding,
          model: m.embeddingModel || SUPPORTED_EMBEDDING_SPECS.model,
          dimensions: m.embeddingDimensions || SUPPORTED_EMBEDDING_SPECS.dimensions,
          version: m.embeddingVersion || SUPPORTED_EMBEDDING_SPECS.version,
        });
        indexedCount++;
      }
    }

    this.lastIndexedAt = new Date();
    return indexedCount;
  }

  get(movieId) {
    return this.vectors.get(String(movieId));
  }

  has(movieId) {
    return this.vectors.has(String(movieId));
  }

  size() {
    return this.vectors.size;
  }

  getAllEntries() {
    return Array.from(this.vectors.values());
  }
}

export const movieVectorIndex = new MovieVectorIndex();

// In-memory user taste vector cache
class UserVectorCache {
  constructor(ttlMs = 15 * 60 * 1000) { // 15-minute default TTL
    this.cache = new Map(); // userId -> { positiveVector, negativeVector, cachedAt }
    this.ttlMs = ttlMs;
  }

  get(userId) {
    const entry = this.cache.get(String(userId));
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.cache.delete(String(userId));
      return null;
    }
    return entry;
  }

  set(userId, tasteVectors) {
    this.cache.set(String(userId), {
      ...tasteVectors,
      cachedAt: Date.now(),
    });
  }

  invalidate(userId) {
    this.cache.delete(String(userId));
  }

  clear() {
    this.cache.clear();
  }
}

export const userVectorCache = new UserVectorCache();

/**
 * Build Dual User Taste Vectors (Positive and Negative preference vectors).
 *
 * Separating positive and negative interactions prevents negative signals from
 * contaminating or neutralizing positive vectors, while allowing calibrated repulsion.
 *
 * @param {Object} params
 * @param {Object[]} [params.likedMovies=[]]
 * @param {Object[]} [params.dislikedMovies=[]]
 * @param {Object[]} [params.userReviews=[]]
 * @param {Object[]} [params.watchlistMovies=[]]
 * @param {Object[]} [params.trailerHistory=[]]
 * @param {Object} [params.config=DEFAULT_INTERACTION_WEIGHTS]
 * @returns {{ positiveUserVector: number[]|null, negativeUserVector: number[]|null, hasVectors: boolean }}
 */
export function buildUserTasteVectors({
  likedMovies = [],
  dislikedMovies = [],
  userReviews = [],
  watchlistMovies = [],
  trailerHistory = [],
  config = DEFAULT_INTERACTION_WEIGHTS,
} = {}) {
  const cfg = { ...DEFAULT_INTERACTION_WEIGHTS, ...config };
  const dim = SUPPORTED_EMBEDDING_SPECS.dimensions;

  const posAccum = new Float64Array(dim);
  const negAccum = new Float64Array(dim);
  let posWeightSum = 0;
  let negWeightSum = 0;

  // Track processed movie interactions to prevent double-counting
  const processedEvents = new Set();

  function getEmbedding(movie) {
    if (!movie) return null;
    if (movie.embedding && isValidVector(movie.embedding, dim)) return movie.embedding;
    const fromIndex = movieVectorIndex.get(String(movie._id || movie));
    if (fromIndex?.embedding) return fromIndex.embedding;
    return null;
  }

  // 1. Reviews (Strong signal: graded ratings)
  userReviews.forEach((rev) => {
    if (!rev || !rev.movie) return;
    const movieId = String(rev.movie._id || rev.movie);
    const emb = getEmbedding(rev.movie);
    if (!emb) return;

    const eventKey = `review:${movieId}`;
    if (processedEvents.has(eventKey)) return;
    processedEvents.add(eventKey);

    const decay = computeTimeDecay(rev.createdAt || rev.updatedAt, cfg.halfLifeDays);
    const rating = Number(rev.rating);

    if (rating >= 9) {
      const w = cfg.reviewHigh * decay;
      for (let i = 0; i < dim; i++) posAccum[i] += w * emb[i];
      posWeightSum += w;
    } else if (rating >= 7) {
      const w = cfg.reviewGood * decay;
      for (let i = 0; i < dim; i++) posAccum[i] += w * emb[i];
      posWeightSum += w;
    } else if (rating >= 5) {
      const w = cfg.reviewMixed * decay;
      for (let i = 0; i < dim; i++) posAccum[i] += w * emb[i];
      posWeightSum += w;
    } else if (rating <= 4) {
      // Negative review channel
      const w = cfg.reviewNegative * decay;
      for (let i = 0; i < dim; i++) negAccum[i] += w * emb[i];
      negWeightSum += w;
    }
  });

  // 2. Explicit Likes
  likedMovies.forEach((m) => {
    if (!m) return;
    const movieId = String(m._id || m);
    const emb = getEmbedding(m);
    if (!emb) return;

    const eventKey = `like:${movieId}`;
    if (processedEvents.has(eventKey)) return;
    processedEvents.add(eventKey);

    // Likes are strong positive signals
    const decay = computeTimeDecay(m.likedAt, cfg.halfLifeDays);
    const w = cfg.like * decay;
    for (let i = 0; i < dim; i++) posAccum[i] += w * emb[i];
    posWeightSum += w;
  });

  // 3. Explicit Dislikes (Negative preference channel)
  dislikedMovies.forEach((m) => {
    if (!m) return;
    const movieId = String(m._id || m);
    const emb = getEmbedding(m);
    if (!emb) return;

    const eventKey = `dislike:${movieId}`;
    if (processedEvents.has(eventKey)) return;
    processedEvents.add(eventKey);

    const decay = computeTimeDecay(m.dislikedAt, cfg.halfLifeDays);
    const w = cfg.dislike * decay;
    for (let i = 0; i < dim; i++) negAccum[i] += w * emb[i];
    negWeightSum += w;
  });

  // 4. Watchlist (Moderate positive intent)
  watchlistMovies.forEach((wEntry) => {
    const m = wEntry?.movie || wEntry;
    if (!m) return;
    const movieId = String(m._id || m);
    const emb = getEmbedding(m);
    if (!emb) return;

    const eventKey = `watchlist:${movieId}`;
    if (processedEvents.has(eventKey)) return;
    processedEvents.add(eventKey);

    const decay = computeTimeDecay(wEntry?.addedAt, cfg.halfLifeDays);
    const w = cfg.watchlist * decay;
    for (let i = 0; i < dim; i++) posAccum[i] += w * emb[i];
    posWeightSum += w;
  });

  // 5. Trailer History (Weak signal, capped to prevent distortion)
  const trailerCounts = new Map();
  trailerHistory.forEach((tEntry) => {
    const m = tEntry?.movie || tEntry;
    if (!m) return;
    const movieId = String(m._id || m);
    const count = (trailerCounts.get(movieId) || 0) + 1;
    trailerCounts.set(movieId, count);

    if (count > cfg.trailerMaxPerMovie) return; // Cap repeated trailer clicks

    const emb = getEmbedding(m);
    if (!emb) return;

    const decay = computeTimeDecay(tEntry?.watchedAt, cfg.halfLifeDays);
    const w = cfg.trailerHistory * decay;
    for (let i = 0; i < dim; i++) posAccum[i] += w * emb[i];
    posWeightSum += w;
  });

  const positiveUserVector = posWeightSum > 0 ? normalizeVector(Array.from(posAccum)) : null;
  const negativeUserVector = negWeightSum > 0 ? normalizeVector(Array.from(negAccum)) : null;

  return {
    positiveUserVector,
    negativeUserVector,
    hasVectors: positiveUserVector !== null || negativeUserVector !== null,
  };
}

/**
 * Calculate the calibrated semantic score of a candidate movie vector
 * against user taste vectors.
 *
 * semanticScore = max(0, cosine(v_pos, v_movie) - penalty * cosine(v_neg, v_movie))
 * Normalized into [0.0, 1.0].
 *
 * @param {number[]} movieEmbedding
 * @param {number[]|null} positiveUserVector
 * @param {number[]|null} negativeUserVector
 * @param {number} [negativePenalty=0.5]
 * @returns {number|null} - Null if positive user vector is unavailable
 */
export function calculateSemanticScore(
  movieEmbedding,
  positiveUserVector,
  negativeUserVector,
  negativePenalty = 0.5
) {
  if (!movieEmbedding || !positiveUserVector) return null;

  // Cosine with positive vector
  const posSim = cosineSimilarity(positiveUserVector, movieEmbedding);

  // Cosine with negative vector (if present)
  let negSim = 0;
  if (negativeUserVector) {
    negSim = Math.max(0, cosineSimilarity(negativeUserVector, movieEmbedding));
  }

  // Net semantic score
  const netScore = posSim - negativePenalty * negSim;

  // Normalize from [-1.0, 1.0] to [0.0, 1.0]
  // In practice, relevant films score between 0.4 and 0.95
  const clamped = Math.max(0, Math.min(1.0, (netScore + 1) / 2));
  return parseFloat(clamped.toFixed(4));
}

/**
 * Retrieve Top-K semantic candidates from the in-memory vector index.
 *
 * Supports both user taste vectors (personalized) and natural-language query vectors.
 *
 * @param {Object} params
 * @param {number[]|null} [params.positiveUserVector=null]
 * @param {number[]|null} [params.negativeUserVector=null]
 * @param {number[]|null} [params.queryVector=null]
 * @param {Set<string>} [params.excludedIds=new Set()]
 * @param {number} [params.limit=50]
 * @param {number} [params.negativePenalty=0.5]
 * @returns {Object[]} - Array of { movieId, title, similarity, semanticScore }
 */
export function getSemanticCandidates({
  positiveUserVector = null,
  negativeUserVector = null,
  queryVector = null,
  excludedIds = new Set(),
  limit = 50,
  negativePenalty = 0.5,
} = {}) {
  const targetVector = queryVector || positiveUserVector;
  if (!targetVector) return [];

  const candidates = [];
  const entries = movieVectorIndex.getAllEntries();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (excludedIds.has(entry.movieId)) continue;

    let score = 0;
    if (queryVector) {
      const rawSim = cosineSimilarity(queryVector, entry.embedding);
      score = Math.max(0, Math.min(1.0, (rawSim + 1) / 2));
    } else {
      score = calculateSemanticScore(
        entry.embedding,
        positiveUserVector,
        negativeUserVector,
        negativePenalty
      );
      if (score === null) continue;
    }

    candidates.push({
      movieId: entry.movieId,
      title: entry.title,
      year: entry.year,
      language: entry.language,
      genres: entry.genres,
      semanticScore: parseFloat(score.toFixed(4)),
    });
  }

  candidates.sort((a, b) => b.semanticScore - a.semanticScore);
  return candidates.slice(0, limit);
}
