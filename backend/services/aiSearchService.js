import { aiService } from './ai/aiService.js';
import {
  movieVectorIndex,
  buildUserTasteVectors,
  userVectorCache,
  calculateSemanticScore,
  cosineSimilarity,
  isValidVector,
  normalizeVector,
  getSemanticCandidates,
} from './semanticRecommendationService.js';
import {
  calculateQualityScore,
  calculateBaselineBehaviorScore,
  applyMMRDiversity,
  getMovieLanguage,
  normalizeLanguageCode,
  buildGenreFrequencyMap,
  DEFAULT_HYBRID_CONFIG,
} from './recommendationService.js';

export const DEFAULT_AI_SEARCH_CONFIG = {
  candidatePoolLimit: 50,
  finalRerankPoolLimit: 30,
  mmrLambda: 0.70,
  // Weighting when query vector and user taste are both present
  weightsWithUser: {
    querySemantic: 0.35,
    queryMetadata: 0.25,
    userTaste: 0.15,
    quality: 0.15,
    novelty: 0.10,
  },
  // Weighting for anonymous users or when user has no taste vector
  weightsWithoutUser: {
    querySemantic: 0.40,
    queryMetadata: 0.30,
    quality: 0.18,
    novelty: 0.12,
  },
};

/**
 * Calculates match score between candidate movie and structured search intent.
 * Evaluates genres, languages, themes, moods, directors, and actors.
 * Normalized to [0.0, 1.0].
 */
export function calculateIntentMetadataScore(movie, intent = {}) {
  if (!movie || !intent) return 0;
  let score = 0;
  let maxPossible = 0;

  // 1. Genre alignment (Weight 4)
  const targetGenres = intent.genres || [];
  if (targetGenres.length > 0) {
    maxPossible += 4;
    if (Array.isArray(movie.genres)) {
      const movieGenres = movie.genres.map(g => String(g).trim().toLowerCase());
      const matchCount = targetGenres.filter(g => movieGenres.includes(String(g).trim().toLowerCase())).length;
      score += 4 * (matchCount / Math.max(1, targetGenres.length));
    }
  }

  // 2. Language alignment (Weight 5 if explicitly requested in query)
  const targetLangs = intent.languages || [];
  if (targetLangs.length > 0) {
    maxPossible += 5;
    const movieLang = getMovieLanguage(movie);
    if (targetLangs.includes(movieLang)) {
      score += 5;
    }
  }

  // 3. Theme & Mood alignment (Weight 3)
  const targetThemes = [...(intent.themes || []), ...(intent.moods || [])];
  if (targetThemes.length > 0) {
    maxPossible += 3;
    const movieThemes = [
      ...(movie.themes || []),
      ...(movie.moods || []),
      ...(movie.keywords || []),
      ...(movie.genres || []),
      movie.description || '',
      movie.synopsis || '',
      movie.overview || '',
    ].map(s => String(s).toLowerCase()).join(' ');

    let matchedCount = 0;
    targetThemes.forEach(t => {
      if (movieThemes.includes(String(t).toLowerCase())) matchedCount++;
    });
    score += 3 * (matchedCount / Math.max(1, targetThemes.length));
  }

  // 4. Director alignment (Weight 2)
  const targetDirectors = intent.directors || [];
  if (targetDirectors.length > 0) {
    maxPossible += 2;
    if (movie.director) {
      const dLower = movie.director.trim().toLowerCase();
      const match = targetDirectors.some(td => dLower.includes(String(td).toLowerCase()) || String(td).toLowerCase().includes(dLower));
      if (match) score += 2;
    }
  }

  // 5. Actor alignment (Weight 1)
  const targetActors = intent.actors || [];
  if (targetActors.length > 0) {
    maxPossible += 1;
    if (Array.isArray(movie.cast)) {
      const castLower = movie.cast.map(c => String(c).toLowerCase());
      const match = targetActors.some(ta => castLower.some(c => c.includes(String(ta).toLowerCase())));
      if (match) score += 1;
    }
  }

  if (maxPossible === 0) return 0.5;
  return parseFloat((score / maxPossible).toFixed(4));
}

/**
 * Parse human duration strings like "2h 49m", "1h 35m", "120 min" into integer minutes.
 *
 * @param {string|number} duration
 * @returns {number|null}
 */
export function parseDurationMinutes(duration) {
  if (!duration) return null;
  if (typeof duration === 'number') return duration;
  const str = String(duration).trim().toLowerCase();

  let totalMinutes = 0;
  const hoursMatch = str.match(/(\d+)\s*h/);
  const minsMatch = str.match(/(\d+)\s*m/);

  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  if (minsMatch) totalMinutes += parseInt(minsMatch[1], 10);

  if (totalMinutes > 0) return totalMinutes;

  const plainMatch = str.match(/^(\d+)/);
  if (plainMatch) return parseInt(plainMatch[1], 10);

  return null;
}

/**
 * Determines whether a movie violates any hard constraints extracted from the natural language query.
 *
 * @param {Object} movie
 * @param {Object} intent
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function evaluateHardFilters(movie, intent = {}) {
  if (!movie) return { allowed: false, reason: 'Invalid movie record' };

  const durationMin = parseDurationMinutes(movie.duration);

  // 1. Hard Runtime Maximum (e.g. "under 2 hours" -> max 120 min)
  if (intent.runtimeMaxMinutes && durationMin !== null) {
    // 5-minute grace tolerance for near-misses
    if (durationMin > intent.runtimeMaxMinutes + 5) {
      return { allowed: false, reason: `Duration ${durationMin}m exceeds max ${intent.runtimeMaxMinutes}m` };
    }
  }

  // 2. Hard Runtime Minimum
  if (intent.runtimeMinMinutes && durationMin !== null) {
    if (durationMin < intent.runtimeMinMinutes - 5) {
      return { allowed: false, reason: `Duration ${durationMin}m below min ${intent.runtimeMinMinutes}m` };
    }
  }

  // 3. Exclusions (e.g. "no romance", "not horror")
  if (Array.isArray(intent.exclusions) && intent.exclusions.length > 0) {
    const movieGenres = (movie.genres || []).map(g => String(g).toLowerCase());
    for (const ex of intent.exclusions) {
      const exLower = String(ex).toLowerCase();
      if (movieGenres.includes(exLower)) {
        return { allowed: false, reason: `Matches excluded genre: ${ex}` };
      }
      if (movie.title && movie.title.toLowerCase().includes(exLower)) {
        return { allowed: false, reason: `Title contains excluded term: ${ex}` };
      }
    }
  }

  // 4. Release Year Min / Max
  const movieYear = Number(movie.year);
  if (!isNaN(movieYear) && movieYear > 0) {
    if (intent.releaseYearMin && movieYear < intent.releaseYearMin) {
      return { allowed: false, reason: `Year ${movieYear} before min ${intent.releaseYearMin}` };
    }
    if (intent.releaseYearMax && movieYear > intent.releaseYearMax) {
      return { allowed: false, reason: `Year ${movieYear} after max ${intent.releaseYearMax}` };
    }
  }

  // 5. Explicit Rating Min
  if (intent.ratingMin && typeof movie.rating === 'number') {
    if (movie.rating < intent.ratingMin) {
      return { allowed: false, reason: `Rating ${movie.rating} below min ${intent.ratingMin}` };
    }
  }

  return { allowed: true };
}

/**
 * Natural-Language AI Movie Discovery Service.
 *
 * Execution Pipeline:
 * 1. AI Intent Extraction (with caching & deterministic fallback).
 * 2. Reference Movie Resolution (checks local StreamFlix catalog).
 * 3. Query Embedding Generation (768-dim, with caching & fallback).
 * 4. Hard Filter Application (runtime, exclusions, release years).
 * 5. Multi-Channel Candidate Retrieval:
 *    - Channel A: Semantic Query Vector Scan (Top 50).
 *    - Channel B: Baseline User Affinity (Top 50 if logged in).
 *    - Channel C: Structured Intent Matching (Top 50).
 *    - Channel D: Quality Discovery (Top 20).
 * 6. Contextual Hybrid Scoring (balancing immediate query intent over long-term taste).
 * 7. MMR Diversity Reranking (λ = 0.70).
 * 8. Return Top 12 with full diagnostics if debug=true.
 *
 * @param {Object} params
 * @param {string} params.query - Natural-language user prompt
 * @param {Object[]} params.allMovies - Entire movie catalog
 * @param {Object} [params.user=null] - Authenticated user document (if logged in)
 * @param {Object[]} [params.likedMovies=[]]
 * @param {Object[]} [params.dislikedMovies=[]]
 * @param {Object[]} [params.userReviews=[]]
 * @param {Object[]} [params.watchlistMovies=[]]
 * @param {Object[]} [params.watchHistory=[]]
 * @param {number} [params.limit=12]
 * @param {boolean} [params.includeDebug=false]
 * @param {Object} [params.customConfig={}]
 * @returns {Promise<{
 *   query: string,
 *   originalIntent: Object,
 *   normalizedIntent: Object,
 *   referenceMovie: Object|null,
 *   isFallback: boolean,
 *   source: string,
 *   latency: { aiLatencyMs: number, localLatencyMs: number, totalLatencyMs: number },
 *   results: Object[],
 *   totalMatches: number
 * }>}
 */
export async function searchMoviesWithAI({
  query = '',
  allMovies = [],
  user = null,
  likedMovies = [],
  dislikedMovies = [],
  userReviews = [],
  watchlistMovies = [],
  watchHistory = [],
  limit = 12,
  includeDebug = false,
  customConfig = {},
} = {}) {
  const tTotalStart = performance.now();
  const cfg = { ...DEFAULT_AI_SEARCH_CONFIG, ...customConfig };

  // Ensure in-memory vector index is primed
  if (movieVectorIndex.size() === 0 && allMovies.length > 0) {
    movieVectorIndex.indexMovies(allMovies);
  }

  // 1. Extract Structured Search Intent
  const tAI0 = performance.now();
  const intentResult = await aiService.extractMovieIntent(query);
  const normalizedIntent = intentResult.normalizedIntent;

  // 2. Resolve Reference Movies (if mentioned, e.g. "like Ratsasan" or "like RRR and Baahubali")
  const resolvedReferences = [];
  if (normalizedIntent.referenceMovies && normalizedIntent.referenceMovies.length > 0) {
    for (const refTitle of normalizedIntent.referenceMovies) {
      const match = aiService.findReferenceMovie(refTitle, allMovies);
      if (match && !resolvedReferences.some(r => String(r._id) === String(match._id))) {
        resolvedReferences.push(match);
      }
    }
  }

  // 3. Generate Query Embedding Vector
  const embedResult = await aiService.embedQuery(query, normalizedIntent);
  let effectiveQueryVector = embedResult.embedding;

  // If reference movies with valid embeddings were found, blend their vectors with the query vector
  const validRefEmbeddings = resolvedReferences
    .map(r => r.embedding)
    .filter(emb => emb && isValidVector(emb));

  if (validRefEmbeddings.length > 0) {
    const refCombined = new Array(validRefEmbeddings[0].length).fill(0);
    for (const emb of validRefEmbeddings) {
      for (let i = 0; i < emb.length; i++) {
        refCombined[i] += emb[i] / validRefEmbeddings.length;
      }
    }
    const normalizedRefVector = normalizeVector(refCombined);

    if (effectiveQueryVector && normalizedRefVector) {
      // 50% query vector + 50% combined reference movies vector
      const blended = new Array(effectiveQueryVector.length);
      for (let i = 0; i < blended.length; i++) {
        blended[i] = 0.5 * effectiveQueryVector[i] + 0.5 * normalizedRefVector[i];
      }
      effectiveQueryVector = normalizeVector(blended) || effectiveQueryVector;
    } else if (normalizedRefVector) {
      effectiveQueryVector = normalizedRefVector;
    }
  }
  const aiLatencyMs = parseFloat((performance.now() - tAI0).toFixed(2));

  // 4. Hard Filter Application & Exclusions
  const tLocal0 = performance.now();
  const excludedIds = new Set();

  // Exclude user disliked movies
  if (dislikedMovies.length > 0) {
    dislikedMovies.forEach(m => m && excludedIds.add(String(m._id || m)));
  }

  // Exclude all resolved reference movies so the reference movie itself does not appear in results
  if (resolvedReferences.length > 0) {
    resolvedReferences.forEach(ref => {
      if (ref && ref._id) excludedIds.add(String(ref._id));
    });
  }

  // Evaluate hard constraints with hierarchical relaxation
  // Non-negotiable: adult content, explicit user exclusions (e.g. "no romance"), and explicitly requested languages
  // Relaxable hierarchy: 1. Exact match -> 2. small runtime tolerance (+15m) -> 3. release year relaxation -> 4. rating relaxation
  let relaxedConstraints = [];
  let relaxationApplied = false;

  let eligibleMovies = allMovies.filter(m => {
    if (!m) return false;
    const mid = String(m._id);
    if (excludedIds.has(mid)) return false;
    const filterCheck = evaluateHardFilters(m, normalizedIntent);
    return filterCheck.allowed;
  });

  // If exact constraints yielded 0 movies, relax softer constraints in strict hierarchical order:
  if (eligibleMovies.length === 0 && allMovies.length > 0) {
    // Step A: Small runtime tolerance (+15 minutes grace)
    if (normalizedIntent.runtimeMaxMinutes || normalizedIntent.runtimeMinMinutes) {
      const relaxedIntent = {
        ...normalizedIntent,
        runtimeMaxMinutes: normalizedIntent.runtimeMaxMinutes ? normalizedIntent.runtimeMaxMinutes + 15 : null,
        runtimeMinMinutes: normalizedIntent.runtimeMinMinutes ? Math.max(0, normalizedIntent.runtimeMinMinutes - 15) : null,
      };
      const candidateStepA = allMovies.filter(m => {
        if (!m || excludedIds.has(String(m._id))) return false;
        return evaluateHardFilters(m, relaxedIntent).allowed;
      });
      if (candidateStepA.length > 0) {
        eligibleMovies = candidateStepA;
        relaxationApplied = true;
        relaxedConstraints.push('runtime_tolerance');
      }
    }

    // Step B: Release year relaxation (if Step A still yielded 0)
    if (eligibleMovies.length === 0 && (normalizedIntent.releaseYearMin || normalizedIntent.releaseYearMax)) {
      const relaxedIntent = {
        ...normalizedIntent,
        runtimeMaxMinutes: null,
        runtimeMinMinutes: null,
        releaseYearMin: null,
        releaseYearMax: null,
      };
      const candidateStepB = allMovies.filter(m => {
        if (!m || excludedIds.has(String(m._id))) return false;
        return evaluateHardFilters(m, relaxedIntent).allowed;
      });
      if (candidateStepB.length > 0) {
        eligibleMovies = candidateStepB;
        relaxationApplied = true;
        relaxedConstraints.push('release_year');
        if (!relaxedConstraints.includes('runtime_tolerance')) relaxedConstraints.push('runtime_tolerance');
      }
    }

    // Step C: Rating relaxation (if still 0)
    if (eligibleMovies.length === 0 && normalizedIntent.ratingMin) {
      const relaxedIntent = {
        ...normalizedIntent,
        runtimeMaxMinutes: null,
        runtimeMinMinutes: null,
        releaseYearMin: null,
        releaseYearMax: null,
        ratingMin: null,
      };
      const candidateStepC = allMovies.filter(m => {
        if (!m || excludedIds.has(String(m._id))) return false;
        return evaluateHardFilters(m, relaxedIntent).allowed;
      });
      if (candidateStepC.length > 0) {
        eligibleMovies = candidateStepC;
        relaxationApplied = true;
        relaxedConstraints.push('rating');
        if (!relaxedConstraints.includes('runtime_tolerance')) relaxedConstraints.push('runtime_tolerance');
        if (!relaxedConstraints.includes('release_year')) relaxedConstraints.push('release_year');
      }
    }

    // Final safety fallback: retain explicit exclusions and languages, relax all softer bounds
    if (eligibleMovies.length === 0) {
      eligibleMovies = allMovies.filter(m => {
        if (!m || excludedIds.has(String(m._id))) return false;
        // Check non-negotiable exclusions
        if (Array.isArray(normalizedIntent.exclusions) && normalizedIntent.exclusions.length > 0) {
          const movieGenres = (m.genres || []).map(g => String(g).toLowerCase());
          for (const ex of normalizedIntent.exclusions) {
            const exLower = String(ex).toLowerCase();
            if (movieGenres.includes(exLower) || (m.title && m.title.toLowerCase().includes(exLower))) {
              return false;
            }
          }
        }
        return true;
      });
      relaxationApplied = true;
      relaxedConstraints = ['runtime_tolerance', 'release_year', 'rating'];
    }
  }

  let candidateCatalog = eligibleMovies;
  let filtersRelaxed = relaxationApplied;

  // 5. Build User Taste Vectors if user is authenticated
  let userTasteVectors = null;
  if (user) {
    const uid = String(user._id || user.id);
    userTasteVectors = userVectorCache.get(uid);
    if (!userTasteVectors) {
      userTasteVectors = buildUserTasteVectors({
        likedMovies,
        dislikedMovies,
        userReviews,
        watchlistMovies,
        trailerHistory: watchHistory,
      });
      if (userTasteVectors.hasVectors) {
        userVectorCache.set(uid, userTasteVectors);
      }
    }
  }

  // Build genre map for behavioral scoring
  const reviewedGenreMap = buildGenreFrequencyMap(userReviews.map(r => r.movie).filter(Boolean));
  const likedGenreMap = buildGenreFrequencyMap(likedMovies.filter(Boolean));
  const watchlistGenreMap = buildGenreFrequencyMap(watchlistMovies.map(w => w.movie || w).filter(Boolean));

  const combinedGenreMap = {};
  Object.entries(reviewedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 3;
  });
  Object.entries(likedGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 2;
  });
  Object.entries(watchlistGenreMap).forEach(([genre, count]) => {
    combinedGenreMap[genre] = (combinedGenreMap[genre] || 0) + count * 1;
  });

  // 6. Multi-Channel Candidate Retrieval
  const candidatePool = new Map(); // movieId -> { movie, channels: Set }

  function addCandidate(movie, channel) {
    if (!movie) return;
    const mid = String(movie._id);
    if (!candidatePool.has(mid)) {
      candidatePool.set(mid, { movie, channels: new Set([channel]) });
    } else {
      candidatePool.get(mid).channels.add(channel);
    }
  }

  // Channel A: Semantic Query Vector Scan (Top 50)
  if (effectiveQueryVector) {
    const semanticHits = getSemanticCandidates({
      queryVector: effectiveQueryVector,
      excludedIds,
      limit: cfg.candidatePoolLimit,
    });
    semanticHits.forEach(hit => {
      const doc = candidateCatalog.find(m => String(m._id) === hit.movieId);
      if (doc) addCandidate(doc, 'semantic_query');
    });
  }

  // If reference movies exist, also seed top 25 nearest neighbors of reference movies
  if (resolvedReferences.length > 0) {
    for (const refDoc of resolvedReferences) {
      if (refDoc && refDoc.embedding && isValidVector(refDoc.embedding)) {
        const refHits = getSemanticCandidates({
          queryVector: refDoc.embedding,
          excludedIds,
          limit: 25,
        });
        refHits.forEach(hit => {
          const doc = candidateCatalog.find(m => String(m._id) === hit.movieId);
          if (doc) addCandidate(doc, 'reference_movie');
        });
      }
    }
  }

  // Channel B: Structured Intent Matching (Top 50)
  const metadataScored = candidateCatalog
    .map(m => ({ movie: m, score: calculateIntentMetadataScore(m, normalizedIntent) }))
    .filter(x => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.movie.rating || 0) - (a.movie.rating || 0);
    })
    .slice(0, cfg.candidatePoolLimit);

  metadataScored.forEach(x => addCandidate(x.movie, 'structured_intent'));

  // Channel C: Baseline User Behavior (Top 50 if logged-in user has signals)
  if (Object.keys(combinedGenreMap).length > 0) {
    const baselineScored = candidateCatalog
      .map(m => ({ movie: m, score: calculateBaselineBehaviorScore(m, combinedGenreMap) }))
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.movie.rating || 0) - (a.movie.rating || 0);
      })
      .slice(0, 30);

    baselineScored.forEach(x => addCandidate(x.movie, 'user_profile'));
  }

  // Channel D: Quality Discovery (Top 20)
  candidateCatalog
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 20)
    .forEach(m => addCandidate(m, 'quality_discovery'));

  // Fallback if candidate pool is empty
  if (candidatePool.size === 0) {
    candidateCatalog.slice(0, cfg.candidatePoolLimit).forEach(m => addCandidate(m, 'fallback'));
  }

  // 7. Contextual Hybrid Scoring
  const candidatesArray = Array.from(candidatePool.values());

  // Find max behavior raw for normalization
  let maxBehaviorRaw = 1;
  candidatesArray.forEach(({ movie }) => {
    const raw = calculateBaselineBehaviorScore(movie, combinedGenreMap);
    if (raw > maxBehaviorRaw) maxBehaviorRaw = raw;
  });

  const hasUserTaste = Boolean(userTasteVectors && userTasteVectors.positiveUserVector);
  const activeWeights = hasUserTaste ? cfg.weightsWithUser : cfg.weightsWithoutUser;

  const scoredCandidates = candidatesArray.map(({ movie, channels }) => {
    // 1. Query Semantic Score
    let semanticQueryScore = null;
    const hasEmbedding = movie.embedding && isValidVector(movie.embedding);
    if (effectiveQueryVector && hasEmbedding) {
      const cos = cosineSimilarity(effectiveQueryVector, movie.embedding);
      semanticQueryScore = parseFloat(Math.max(0, Math.min(1.0, (cos + 1) / 2)).toFixed(4));
    }

    // 2. User Taste Score (Long-term personalization)
    let userTasteScore = null;
    if (hasUserTaste && hasEmbedding) {
      userTasteScore = calculateSemanticScore(movie.embedding, userTasteVectors.positiveUserVector, userTasteVectors.negativeUserVector);
    }

    // 3. User Behavior Score
    const rawBehavior = calculateBaselineBehaviorScore(movie, combinedGenreMap);
    const behaviorScore = parseFloat((rawBehavior / maxBehaviorRaw).toFixed(4));

    // 4. Intent Metadata Score
    const metadataScore = calculateIntentMetadataScore(movie, normalizedIntent);

    // 5. Quality Score
    const qualityScore = calculateQualityScore(movie);

    // 6. Novelty Score
    const views = Number(movie.views) || 0;
    let noveltyScore = parseFloat((1 / (1 + Math.log10(1 + views))).toFixed(4));
    if (normalizedIntent.noveltyPreference === 'hidden_gem') {
      noveltyScore = Math.min(1.0, noveltyScore * 1.3);
    } else if (normalizedIntent.noveltyPreference === 'popular') {
      noveltyScore = parseFloat((Math.log10(1 + views) / 5).toFixed(4));
    }

    // Dynamic weight renormalization when embedding or user profile is absent
    let wQSem = semanticQueryScore !== null ? (activeWeights.querySemantic || 0.40) : 0;
    let wQMet = activeWeights.queryMetadata || 0.30;
    let wUTaste = userTasteScore !== null ? (activeWeights.userTaste || 0.15) : 0;
    let wQual = activeWeights.quality || 0.15;
    let wNov = activeWeights.novelty || 0.10;

    const totalWeight = wQSem + wQMet + wUTaste + wQual + wNov;
    let hybridScore = 0;

    if (totalWeight > 0) {
      hybridScore =
        ((semanticQueryScore !== null ? semanticQueryScore : 0) * wQSem +
          metadataScore * wQMet +
          (userTasteScore !== null ? userTasteScore : 0) * wUTaste +
          qualityScore * wQual +
          noveltyScore * wNov) /
        totalWeight;
    } else {
      hybridScore = qualityScore;
    }

    hybridScore = parseFloat(hybridScore.toFixed(4));

    const debugInfo = {
      movieId: String(movie._id),
      title: movie.title,
      year: movie.year,
      language: getMovieLanguage(movie),
      originalQuery: query,
      normalizedIntent,
      queryEmbeddingAvailable: Boolean(effectiveQueryVector),
      candidateSources: Array.from(channels),
      semanticQueryScore,
      userTasteScore,
      behaviorScore,
      metadataScore,
      qualityScore,
      noveltyScore,
      hybridScore,
      referenceMovies: resolvedReferences.map(r => ({ _id: r._id, title: r.title })),
      referenceMovie: resolvedReferences[0] ? resolvedReferences[0].title : null,
      relaxationApplied,
      relaxedConstraints,
      matchedGenres: (movie.genres || []).filter(g => (normalizedIntent.genres || []).map(x => x.toLowerCase()).includes(g.toLowerCase())),
      matchedLanguages: normalizedIntent.languages?.includes(getMovieLanguage(movie)),
      matchedThemes: (normalizedIntent.themes || []).filter(t => (movie.description || '').toLowerCase().includes(t)),
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

  // 8. Apply MMR Diversity Reranking
  let finalSelected = top30Pool;
  finalSelected = applyMMRDiversity(top30Pool, limit, cfg.mmrLambda);

  const localLatencyMs = parseFloat((performance.now() - tLocal0).toFixed(2));
  const totalLatencyMs = parseFloat((performance.now() - tTotalStart).toFixed(2));

  // 9. Format Results
  const results = finalSelected.map(item => {
    const movieObj = item.movie.toObject ? item.movie.toObject() : { ...item.movie };
    if (!movieObj.language) {
      movieObj.language = getMovieLanguage(movieObj);
    }
    if (includeDebug) {
      movieObj._debug = {
        ...item.debugInfo,
        mmrScore: item.mmrScore ?? item.hybridScore,
      };
    }
    return movieObj;
  });

  return {
    query,
    originalIntent: intentResult.originalIntent,
    normalizedIntent,
    referenceMovie: resolvedReferences[0] ? { _id: resolvedReferences[0]._id, title: resolvedReferences[0].title } : null,
    referenceMovies: resolvedReferences.map(r => ({ _id: r._id, title: r.title })),
    isFallback: intentResult.isFallback,
    source: intentResult.source,
    filtersRelaxed,
    relaxationApplied,
    relaxedConstraints,
    latency: {
      aiLatencyMs,
      localLatencyMs,
      totalLatencyMs,
    },
    results,
    totalMatches: results.length,
  };
}
