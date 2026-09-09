import crypto from 'node:crypto';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';
import { buildUserTasteVectors, computeTimeDecay } from './semanticRecommendationService.js';
import { defaultGeminiProvider } from './ai/geminiProvider.js';

// Controlled display name mappings
const LANGUAGE_DISPLAY_NAMES = {
  te: 'Telugu',
  hi: 'Hindi',
  en: 'English',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
  ko: 'Korean',
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
};

const LANGUAGE_TO_INDUSTRY = {
  te: 'Tollywood',
  hi: 'Bollywood',
  ta: 'Kollywood',
  ml: 'Mollywood',
  kn: 'Sandalwood',
  en: 'Hollywood',
  telugu: 'Tollywood',
  hindi: 'Bollywood',
  tamil: 'Kollywood',
  malayalam: 'Mollywood',
  kannada: 'Sandalwood',
  english: 'Hollywood',
};

export function formatLanguage(lang) {
  if (!lang) return '';
  const trimmed = String(lang).trim();
  const lower = trimmed.toLowerCase();
  if (LANGUAGE_DISPLAY_NAMES[lower]) {
    return LANGUAGE_DISPLAY_NAMES[lower];
  }
  // If already capitalized display name, return it
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatIndustry(industry, language) {
  if (industry && typeof industry === 'string' && industry.trim()) {
    return industry.trim();
  }
  const langKey = String(language || '').toLowerCase().trim();
  const ind = LANGUAGE_TO_INDUSTRY[langKey];
  return (ind && ind !== 'Cinema') ? ind : null;
}

/**
 * Truncates text to at most maxSentences.
 */
export function truncateToSentences(text, maxSentences = 2) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim().replace(/\s+/g, ' ');
  const match = clean.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!match || match.length === 0) return clean;
  return match.slice(0, maxSentences).join('').trim();
}

/**
 * Multi-Tenant In-Memory Cache with LRU and TTL.
 */
export class TasteProfileCache {
  constructor(maxEntries = 1000, ttlMs = 24 * 60 * 60 * 1000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.userKeyMap = new Map(); // userId -> Set of cache keys
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  buildCompoundKey(userId, profileVersion, model = 'gemini-3.5-flash-lite', promptVersion = 'v1') {
    return buildCompoundCacheKey(userId, profileVersion, model, promptVersion);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;
    return entry.value;
  }

  set(key, value, userId = null) {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }
    const uStr = userId ? String(userId) : null;
    this.cache.set(key, {
      value,
      userId: uStr,
      expiresAt: Date.now() + this.ttlMs,
      cachedAt: Date.now(),
    });
    if (uStr) {
      if (!this.userKeyMap.has(uStr)) {
        this.userKeyMap.set(uStr, new Set());
      }
      this.userKeyMap.get(uStr).add(key);
    }
  }

  invalidate(userId) {
    if (!userId) return;
    const uStr = String(userId);
    const keys = this.userKeyMap.get(uStr);
    if (keys) {
      for (const k of keys) {
        this.cache.delete(k);
      }
      this.userKeyMap.delete(uStr);
    }
    // Defensive sweep for any key tagged with this userId
    for (const [k, entry] of this.cache.entries()) {
      if (entry.userId === uStr) {
        this.cache.delete(k);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.userKeyMap.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
}

export const tasteProfileCache = new TasteProfileCache();

/**
 * Compound SHA-256 Cache Key Builder (R3)
 */
export function buildCompoundCacheKey(userId, profileVersion, model = 'gemini-3.5-flash-lite', promptVersion = 'v1') {
  const parts = ['taste-profile', String(userId), String(profileVersion), String(model), String(promptVersion)];
  return crypto.createHash('sha256').update(parts.join(':')).digest('hex');
}

/**
 * Deterministic User Context Hash / Profile Version (R3)
 */
export function computeProfileVersion(userDoc, reviews = [], watchlist = []) {
  const likedIds = (userDoc?.likedMovies || [])
    .map(m => String(m?._id || m))
    .sort()
    .join(',');

  const dislikedIds = (userDoc?.dislikedMovies || [])
    .map(m => String(m?._id || m))
    .sort()
    .join(',');

  const explicitGenres = (userDoc?.preferences?.genres || [])
    .map(g => String(g).toLowerCase().trim())
    .sort()
    .join(',');

  const explicitLang = String(userDoc?.preferences?.subtitleLang || '').toLowerCase().trim();

  const reviewMeta = (reviews || [])
    .map(r => `${String(r.movie?._id || r.movie || '')}:${r.rating}:${new Date(r.updatedAt || r.createdAt || 0).getTime()}`)
    .sort()
    .join(';');

  const watchlistMeta = (watchlist || [])
    .map(w => `${String(w.movie?._id || w.movie || '')}:${new Date(w.addedAt || w.createdAt || 0).getTime()}`)
    .sort()
    .join(';');

  const trailerMeta = (userDoc?.trailerHistory || [])
    .map(t => `${String(t.movie?._id || t.movie || '')}:${new Date(t.watchedAt || 0).getTime()}`)
    .sort()
    .join(';');

  const userUpdated = new Date(userDoc?.updatedAt || 0).getTime();

  const raw = [
    likedIds,
    dislikedIds,
    explicitGenres,
    explicitLang,
    reviewMeta,
    watchlistMeta,
    trailerMeta,
    userUpdated,
  ].join('|');

  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

export const computeDeterministicProfileVersion = computeProfileVersion;

/**
 * Extract normalized movie metadata fields safely.
 */
function extractMovieMetadata(movie) {
  if (!movie || typeof movie !== 'object') {
    return { genres: [], language: null, industry: null, themes: [], moods: [], director: null };
  }
  const genres = Array.isArray(movie.genres) ? movie.genres.filter(Boolean) : [];
  const rawLang = movie.languageName || movie.language || '';
  const language = formatLanguage(rawLang) || null;
  const rawInd = formatIndustry(movie.industry, movie.language || movie.languageName);
  const industry = (rawInd && rawInd !== 'Cinema') ? rawInd : null;
  const themes = Array.isArray(movie.themes) ? movie.themes.filter(Boolean) : [];
  const moods = Array.isArray(movie.moods) ? movie.moods.filter(Boolean) : [];
  const director = movie.director && typeof movie.director === 'string' && movie.director.trim() ? movie.director.trim() : null;

  return { genres, language, industry, themes, moods, director };
}

/**
 * Deterministic Rule-Based Fallback Verbalizer (R2)
 */
export function getFallbackTasteSummary(profile) {
  if (!profile || profile.profileStrength === 'low') {
    return {
      headline: 'Building Your Taste Profile',
      summary: 'Not enough viewing activity yet to build a reliable taste profile. Watch trailers, like movies, or write reviews to personalize your StreamFlix experience.',
      text: 'Not enough viewing activity yet to build a reliable taste profile. Watch trailers, like movies, or write reviews to personalize your StreamFlix experience.',
      highlights: (profile?.topGenres || []).slice(0, 3),
      confidence: 'low',
      source: 'cold-start',
    };
  }

  const topGenres = profile.topGenres || [];
  const topLanguages = profile.topLanguages || [];
  const topThemes = profile.topThemes || [];
  const avoided = profile.avoidedGenres || [];

  const genreStr = topGenres.slice(0, 2).join(' & ');
  const langStr = topLanguages[0] ? `in ${topLanguages[0]} cinema` : '';
  const themeStr = topThemes[0] ? `with an affinity for ${topThemes[0].toLowerCase()} themes` : '';
  const avoidedStr = avoided.length > 0 ? ` Generally steers clear of ${avoided.join(' and ')}.` : '';

  const headline = genreStr ? `${genreStr} Enthusiast` : 'Eclectic Film Explorer';
  let positivePart = `Frequently enjoys ${genreStr || 'diverse cinema'}`;
  if (langStr) positivePart += ` ${langStr}`;
  if (themeStr) positivePart += ` ${themeStr}`;
  positivePart += '.';
  const summaryText = `${positivePart}${avoidedStr}`.replace(/\s+\./g, '.').replace(/\s+/g, ' ').trim();

  const highlights = [
    ...topGenres.slice(0, 2),
    ...topLanguages.slice(0, 1),
  ].slice(0, 3);

  return {
    headline,
    summary: summaryText,
    text: summaryText,
    highlights,
    confidence: profile.profileStrength,
    source: 'fallback',
    isFallback: true,
  };
}

/**
 * Post-generation anti-hallucination and score leakage validator (R2)
 */
export function validateTasteProfileSummary(summaryData, profile) {
  if (!summaryData || typeof summaryData !== 'object') {
    return { valid: false, reason: 'Summary data is not an object' };
  }

  const { headline, summary, highlights } = summaryData;
  if (!headline || typeof headline !== 'string' || !headline.trim()) {
    return { valid: false, reason: 'Headline is missing or empty' };
  }
  if (!summary || typeof summary !== 'string' || !summary.trim()) {
    return { valid: false, reason: 'Summary text is missing or empty' };
  }

  // 1. Zero Score Leakage Check
  const leakageRegex = /semanticScore|hybridScore|cosineSimilarity|vector|embedding|weight|similarity|\b0\.\d{2,}\b/i;
  if (leakageRegex.test(headline) || leakageRegex.test(summary)) {
    return { valid: false, reason: 'Detected internal scoring or vector leakage' };
  }

  // 2. Controlled Whitelist Construction
  const controlledEntities = [
    ...(profile.topGenres || []),
    ...(profile.topLanguages || []),
    ...(profile.topIndustries || []),
    ...(profile.topThemes || []),
    ...(profile.topMoods || []),
    ...(profile.topDirectors || []),
    ...(profile.recentInterests || []),
    ...(profile.avoidedGenres || []),
  ].map(e => String(e).toLowerCase().trim());

  // 3. Avoided Genres Check (ensure avoided genres are not claimed as favorites)
  for (const avoided of (profile.avoidedGenres || [])) {
    const avoidedLower = avoided.toLowerCase();
    const positiveClaimRegex = new RegExp(`(?:loves|enjoys|favorites?|passionate about|fan of|craves)\\s+[^.!?]*\\b${avoidedLower}\\b`, 'i');
    if (positiveClaimRegex.test(summary)) {
      return { valid: false, reason: `Avoided genre ${avoided} claimed as positive preference` };
    }
  }

  // 4. Fabricated Awards & Accolades Check
  const fabricatedAwardsRegex = /\b(?:academy award|oscar|grammy|golden globe|national award|bafta|cannes|palme d'or)\b/i;
  if (fabricatedAwardsRegex.test(summary) || fabricatedAwardsRegex.test(headline)) {
    return { valid: false, reason: 'Detected fabricated awards or accolades claim' };
  }

  // 5. Invented Director or Actor Check
  const personClaimMatch = summary.match(/(?:directed by|starring|filmmaker|actor|actress|director)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi);
  if (personClaimMatch) {
    for (const match of personClaimMatch) {
      const name = match.replace(/^(?:directed by|starring|filmmaker|actor|actress|director)\s+/i, '').trim();
      const nameLower = name.toLowerCase();
      const isKnown = (profile.topDirectors || []).some(d => d.toLowerCase() === nameLower);
      if (!isKnown) {
        return { valid: false, reason: `Unsupported director/actor claim: ${name}` };
      }
    }
  }

  // 6. Highlights Whitelist Validation
  let validHighlights = [];
  if (Array.isArray(highlights)) {
    for (const chip of highlights) {
      const chipStr = String(chip || '').trim();
      if (!chipStr) continue;
      const chipLower = chipStr.toLowerCase();
      // Check against controlled whitelist
      const matchesControlled = controlledEntities.some(
        ent => ent === chipLower || chipLower.includes(ent) || ent.includes(chipLower)
      );
      if (!matchesControlled) {
        // Chip contains foreign or invented entity
        return { valid: false, reason: `Highlight chip "${chipStr}" not grounded in controlled vocabulary` };
      }
      validHighlights.push(chipStr);
    }
  }

  validHighlights = validHighlights.slice(0, 3);
  if (validHighlights.length === 0) {
    validHighlights = [
      ...(profile.topGenres || []).slice(0, 2),
      ...(profile.topLanguages || []).slice(0, 1),
    ].slice(0, 3);
  }

  const truncatedSummary = truncateToSentences(summary, 2);

  return {
    valid: true,
    sanitized: {
      headline: headline.trim().slice(0, 80),
      summary: truncatedSummary,
      text: truncatedSummary,
      highlights: validHighlights,
      confidence: summaryData.confidence || profile.profileStrength || 'medium',
    },
  };
}

/**
 * Gemini Structured Output JSON Schema for Taste Profile Verbalizer
 */
const TASTE_PROFILE_SUMMARY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING', description: 'Punchy 3-7 word title summarizing user movie taste' },
    summary: { type: 'STRING', description: 'Strictly 1-2 sentence description grounded solely in provided profile' },
    highlights: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Up to 3 concise highlight chips matching entities in the profile'
    },
    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] }
  },
  required: ['headline', 'summary', 'highlights', 'confidence']
};

/**
 * Pure Deterministic Local Taste Profile Computation Engine (R1)
 */
export function buildDeterministicTasteProfile({
  userDoc = null,
  reviews = [],
  watchlist = [],
  trailerHistory = null,
} = {}) {
  const explicitGenres = Array.isArray(userDoc?.preferences?.genres) ? userDoc.preferences.genres.filter(Boolean) : [];
  const explicitSubtitleLang = userDoc?.preferences?.subtitleLang || '';
  const likedMovies = (userDoc?.likedMovies || []).filter(Boolean);
  const dislikedMovies = (userDoc?.dislikedMovies || []).filter(Boolean);
  const rawTrailers = trailerHistory !== null ? trailerHistory : (userDoc?.trailerHistory || []);
  const effectiveTrailerHistory = (rawTrailers || []).filter(t => t && t.movie);
  const validReviews = (reviews || []).filter(r => r && r.movie);
  const validWatchlist = (watchlist || []).filter(w => w && w.movie);

  // Positive channel score maps and count maps
  const posGenreScores = new Map();
  const posGenreCounts = new Map();
  const posLangScores = new Map();
  const posLangCounts = new Map();
  const posIndustryScores = new Map();
  const posIndustryCounts = new Map();
  const posThemeScores = new Map();
  const posThemeCounts = new Map();
  const posMoodScores = new Map();
  const posMoodCounts = new Map();
  const posDirectorScores = new Map();
  const posDirectorCounts = new Map();

  // Negative channel (avoided genres)
  const negGenreScores = new Map();
  const negGenreCounts = new Map();

  // Recency channel (decay >= 0.70)
  const recentGenreScores = new Map();
  const recentThemeScores = new Map();
  const recentMoodScores = new Map();

  let totalPosWeight = 0;
  let trailerEventCount = 0;

  function addScore(map, key, delta) {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + delta);
  }

  function addCount(map, key) {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  }

  // 1. Explicit preferences (Permanent signal, decay = 1.0)
  explicitGenres.forEach((g) => {
    addScore(posGenreScores, g, 1.0);
    addCount(posGenreCounts, g);
    addCount(posGenreCounts, g); // counts as 2 confirmed intents
    totalPosWeight += 1.0;
  });

  if (explicitSubtitleLang) {
    const formattedLang = formatLanguage(explicitSubtitleLang);
    if (formattedLang) {
      addScore(posLangScores, formattedLang, 0.8);
      addCount(posLangCounts, formattedLang);
      addCount(posLangCounts, formattedLang);
      totalPosWeight += 0.8;
      const ind = formatIndustry(null, explicitSubtitleLang);
      if (ind && ind !== 'Cinema') {
        addScore(posIndustryScores, ind, 0.8);
        addCount(posIndustryCounts, ind);
      }
    }
  }

  // 2. Reviews (Graded signals)
  validReviews.forEach((rev) => {
    const rawRating = rev.rating;
    const hasValidRating = typeof rawRating === 'number' && !isNaN(rawRating);

    // Guard: Unrated reviews (null/undefined) MUST NOT be penalized into avoidedGenres
    if (!hasValidRating) {
      return;
    }

    const meta = extractMovieMetadata(rev.movie);
    const eventDate = rev.updatedAt || rev.createdAt;
    const decay = computeTimeDecay(eventDate, 30);
    const isRecent = decay >= 0.70;

    if (rawRating >= 9) {
      const w = 1.0 * decay;
      totalPosWeight += w;
      meta.genres.forEach(g => { addScore(posGenreScores, g, w); addCount(posGenreCounts, g); if (isRecent) addScore(recentGenreScores, g, w); });
      if (meta.language) { addScore(posLangScores, meta.language, w); addCount(posLangCounts, meta.language); }
      if (meta.industry) { addScore(posIndustryScores, meta.industry, w); addCount(posIndustryCounts, meta.industry); }
      meta.themes.forEach(th => { addScore(posThemeScores, th, w); addCount(posThemeCounts, th); if (isRecent) addScore(recentThemeScores, th, w); });
      meta.moods.forEach(m => { addScore(posMoodScores, m, w); addCount(posMoodCounts, m); if (isRecent) addScore(recentMoodScores, m, w); });
      if (meta.director) { addScore(posDirectorScores, meta.director, w); addCount(posDirectorCounts, meta.director); }
    } else if (rawRating >= 7) {
      const w = 0.7 * decay;
      totalPosWeight += w;
      meta.genres.forEach(g => { addScore(posGenreScores, g, w); addCount(posGenreCounts, g); if (isRecent) addScore(recentGenreScores, g, w); });
      if (meta.language) { addScore(posLangScores, meta.language, w); addCount(posLangCounts, meta.language); }
      if (meta.industry) { addScore(posIndustryScores, meta.industry, w); addCount(posIndustryCounts, meta.industry); }
      meta.themes.forEach(th => { addScore(posThemeScores, th, w); addCount(posThemeCounts, th); if (isRecent) addScore(recentThemeScores, th, w); });
      meta.moods.forEach(m => { addScore(posMoodScores, m, w); addCount(posMoodCounts, m); if (isRecent) addScore(recentMoodScores, m, w); });
      if (meta.director) { addScore(posDirectorScores, meta.director, w); addCount(posDirectorCounts, meta.director); }
    } else if (rawRating >= 5) {
      const w = 0.2 * decay;
      totalPosWeight += w;
      meta.genres.forEach(g => { addScore(posGenreScores, g, w); addCount(posGenreCounts, g); });
      if (meta.language) { addScore(posLangScores, meta.language, w); addCount(posLangCounts, meta.language); }
      if (meta.industry) { addScore(posIndustryScores, meta.industry, w); addCount(posIndustryCounts, meta.industry); }
      meta.themes.forEach(th => { addScore(posThemeScores, th, w); addCount(posThemeCounts, th); });
      meta.moods.forEach(m => { addScore(posMoodScores, m, w); addCount(posMoodCounts, m); });
      if (meta.director) { addScore(posDirectorScores, meta.director, w); addCount(posDirectorCounts, meta.director); }
    } else if (rawRating >= 1) {
      // Negative review (rating 1-4)
      const w = 0.6 * decay;
      meta.genres.forEach(g => { addScore(negGenreScores, g, w); addCount(negGenreCounts, g); });
    }
  });

  // 3. Liked Movies (weight 0.8)
  likedMovies.forEach((m) => {
    const meta = extractMovieMetadata(m);
    const eventDate = m.likedAt || null;
    const decay = eventDate ? computeTimeDecay(eventDate, 30) : 1.0;
    const isRecent = decay >= 0.70;
    const w = 0.8 * decay;
    totalPosWeight += w;
    meta.genres.forEach(g => { addScore(posGenreScores, g, w); addCount(posGenreCounts, g); if (isRecent) addScore(recentGenreScores, g, w); });
    if (meta.language) { addScore(posLangScores, meta.language, w); addCount(posLangCounts, meta.language); }
    if (meta.industry) { addScore(posIndustryScores, meta.industry, w); addCount(posIndustryCounts, meta.industry); }
    meta.themes.forEach(th => { addScore(posThemeScores, th, w); addCount(posThemeCounts, th); if (isRecent) addScore(recentThemeScores, th, w); });
    meta.moods.forEach(m => { addScore(posMoodScores, m, w); addCount(posMoodCounts, m); if (isRecent) addScore(recentMoodScores, m, w); });
    if (meta.director) { addScore(posDirectorScores, meta.director, w); addCount(posDirectorCounts, meta.director); }
  });

  // 4. Disliked Movies (weight 0.8 to negative channel)
  dislikedMovies.forEach((m) => {
    const meta = extractMovieMetadata(m);
    const eventDate = m.dislikedAt || null;
    const decay = eventDate ? computeTimeDecay(eventDate, 30) : 1.0;
    const w = 0.8 * decay;
    meta.genres.forEach(g => { addScore(negGenreScores, g, w); addCount(negGenreCounts, g); });
  });

  // 5. Watchlist (weight 0.5)
  validWatchlist.forEach((item) => {
    const meta = extractMovieMetadata(item.movie);
    const eventDate = item.addedAt || item.createdAt;
    const decay = computeTimeDecay(eventDate, 30);
    const isRecent = decay >= 0.70;
    const w = 0.5 * decay;
    totalPosWeight += w;
    meta.genres.forEach(g => { addScore(posGenreScores, g, w); addCount(posGenreCounts, g); if (isRecent) addScore(recentGenreScores, g, w); });
    if (meta.language) { addScore(posLangScores, meta.language, w); addCount(posLangCounts, meta.language); }
    if (meta.industry) { addScore(posIndustryScores, meta.industry, w); addCount(posIndustryCounts, meta.industry); }
    meta.themes.forEach(th => { addScore(posThemeScores, th, w); addCount(posThemeCounts, th); if (isRecent) addScore(recentThemeScores, th, w); });
    meta.moods.forEach(m => { addScore(posMoodScores, m, w); addCount(posMoodCounts, m); if (isRecent) addScore(recentMoodScores, m, w); });
    if (meta.director) { addScore(posDirectorScores, meta.director, w); addCount(posDirectorCounts, meta.director); }
  });

  // 6. Trailer History (weight 0.15, max 2 starts per movie)
  const trailerMovieCounts = new Map();
  effectiveTrailerHistory.forEach((item) => {
    const movie = item.movie;
    if (!movie) return;
    const mId = String(movie._id || movie);
    const count = trailerMovieCounts.get(mId) || 0;
    if (count >= 2) return;
    trailerMovieCounts.set(mId, count + 1);

    const meta = extractMovieMetadata(movie);
    const eventDate = item.watchedAt;
    const decay = computeTimeDecay(eventDate, 30);
    const isRecent = decay >= 0.70;
    const w = 0.15 * decay;
    totalPosWeight += w;
    trailerEventCount++;

    // Add score for up to 2 plays per movie
    meta.genres.forEach(g => { addScore(posGenreScores, g, w); if (isRecent) addScore(recentGenreScores, g, w); });
    if (meta.language) { addScore(posLangScores, meta.language, w); }
    if (meta.industry) { addScore(posIndustryScores, meta.industry, w); }
    meta.themes.forEach(th => { addScore(posThemeScores, th, w); if (isRecent) addScore(recentThemeScores, th, w); });
    meta.moods.forEach(m => { addScore(posMoodScores, m, w); if (isRecent) addScore(recentMoodScores, m, w); });
    if (meta.director) { addScore(posDirectorScores, meta.director, w); }

    // Count is incremented ONLY for the first play of each unique movie
    if (count === 0) {
      meta.genres.forEach(g => addCount(posGenreCounts, g));
      if (meta.language) addCount(posLangCounts, meta.language);
      if (meta.industry) addCount(posIndustryCounts, meta.industry);
      meta.themes.forEach(th => addCount(posThemeCounts, th));
      meta.moods.forEach(m => addCount(posMoodCounts, m));
      if (meta.director) addCount(posDirectorCounts, meta.director);
    }
  });

  // Minimum data thresholds: Require S_pos >= 0.7 OR count >= 2 OR explicit user preference
  function getEligible(scoreMap, countMap, minScore = 0.7, minCount = 2, explicitList = [], negScoreMap = null) {
    const explicitSet = new Set(explicitList.map(e => String(e).toLowerCase().trim()));
    const candidates = [];

    for (const [key, score] of scoreMap.entries()) {
      const count = countMap.get(key) || 0;
      const isExplicit = explicitSet.has(String(key).toLowerCase().trim());
      const negScore = negScoreMap ? (negScoreMap.get(key) || 0) : 0;

      // Filter out 'Cinema' placeholder
      if (key === 'Cinema') continue;

      // Disqualify if negative signal outweighs positive signal (unless explicit preference)
      if (!isExplicit && negScore >= 0.59 && negScore > score) {
        continue;
      }

      if (isExplicit || score >= minScore || count >= minCount) {
        candidates.push({ key, score, count, isExplicit, netScore: score - negScore });
      }
    }

    candidates.sort((a, b) => {
      if (a.isExplicit && !b.isExplicit) return -1;
      if (!a.isExplicit && b.isExplicit) return 1;
      if (Math.abs(b.score - a.score) > 0.001) return b.score - a.score;
      return b.count - a.count;
    });

    return candidates.map(c => c.key);
  }

  // Pass negGenreScores so strong negative signals prevent admission into topGenres
  const topGenres = getEligible(posGenreScores, posGenreCounts, 0.7, 2, explicitGenres, negGenreScores).slice(0, 5);
  const explicitLangFormatted = explicitSubtitleLang ? [formatLanguage(explicitSubtitleLang)] : [];
  const topLanguages = getEligible(posLangScores, posLangCounts, 0.7, 2, explicitLangFormatted).slice(0, 3);
  const topIndustries = getEligible(posIndustryScores, posIndustryCounts, 0.7, 2).slice(0, 3);
  const topThemes = getEligible(posThemeScores, posThemeCounts, 0.7, 2).slice(0, 5);
  const topMoods = getEligible(posMoodScores, posMoodCounts, 0.7, 2).slice(0, 5);
  const topDirectors = getEligible(posDirectorScores, posDirectorCounts, 0.7, 2).slice(0, 3);

  // Avoided Genres: S_neg >= 0.6 AND S_neg > S_pos AND not in topGenres (max 3)
  const topGenresSet = new Set(topGenres.map(g => g.toLowerCase().trim()));
  const candidateAvoided = [];
  for (const [genre, negScore] of negGenreScores.entries()) {
    const posScore = posGenreScores.get(genre) || 0;
    if (negScore >= 0.59 && negScore > posScore && !topGenresSet.has(genre.toLowerCase().trim())) {
      candidateAvoided.push({ genre, score: negScore });
    }
  }
  candidateAvoided.sort((a, b) => b.score - a.score);
  const avoidedGenres = candidateAvoided.slice(0, 3).map(a => a.genre);

  // Recent Interests: Recent genres/themes with decay >= 0.70 and score >= 0.5 (max 3)
  const candidateRecent = [];
  for (const [genre, score] of recentGenreScores.entries()) {
    if (score >= 0.5) candidateRecent.push({ key: genre, score });
  }
  for (const [theme, score] of recentThemeScores.entries()) {
    if (score >= 0.5) candidateRecent.push({ key: theme, score });
  }
  candidateRecent.sort((a, b) => b.score - a.score);
  const recentInterests = Array.from(new Set(candidateRecent.map(r => r.key))).slice(0, 3);

  // Profile Strength & Evidence Counter
  const totalEvidence = explicitGenres.length +
    likedMovies.length +
    dislikedMovies.length +
    validReviews.length +
    validWatchlist.length +
    Math.floor(trailerEventCount / 2);

  let profileStrength = 'low';
  if (totalEvidence >= 6 && totalPosWeight >= 3.99) {
    profileStrength = 'high';
  } else if (totalEvidence >= 2 || totalPosWeight >= 0.99) {
    profileStrength = 'medium';
  } else {
    profileStrength = 'low';
  }

  // Reuse user taste-vector logic from semanticRecommendationService without duplicating pipelines
  // (vectors are maintained internally; NOT exposed to client)
  buildUserTasteVectors({
    likedMovies,
    dislikedMovies,
    userReviews: validReviews,
    watchlistMovies: validWatchlist.map(w => w.movie).filter(Boolean),
    trailerHistory: effectiveTrailerHistory,
  });

  return {
    topGenres,
    topLanguages,
    topIndustries,
    topThemes,
    topMoods,
    topDirectors,
    recentInterests,
    avoidedGenres,
    profileStrength,
  };
}

/**
 * Main Taste Profile entrypoint for user.
 *
 * @param {string} userId
 * @param {Object} [options={}]
 * @returns {Promise<{ profile: Object, summary: Object }>}
 */
export async function getTasteProfileForUser(userId, options = {}) {
  let userDoc = options.userDoc || null;
  let reviews = options.reviews || null;
  let watchlist = options.watchlist || null;
  let trailerHistory = options.trailerHistory || null;

  // If not provided in options, fetch verified records from MongoDB
  if (!userDoc) {
    const [fetchedUser, fetchedReviews, fetchedWatchlist] = await Promise.all([
      User.findById(userId)
        .populate('likedMovies', 'title genres language languageName industry themes moods director cast embedding _id')
        .populate('dislikedMovies', 'title genres language languageName industry themes moods director cast embedding _id')
        .populate('trailerHistory.movie', 'title genres language languageName industry themes moods director cast embedding _id')
        .lean(),
      reviews ? reviews : Review.find({ user: userId })
        .populate('movie', 'title genres language languageName industry themes moods director cast embedding _id')
        .lean(),
      watchlist ? watchlist : Watchlist.find({ user: userId })
        .populate('movie', 'title genres language languageName industry themes moods director cast embedding _id')
        .lean(),
    ]);

    userDoc = fetchedUser;
    reviews = reviews || fetchedReviews || [];
    watchlist = watchlist || fetchedWatchlist || [];
  } else {
    reviews = reviews || [];
    watchlist = watchlist || [];
  }

  // Handle missing user record
  if (!userDoc) {
    const fallbackProfile = {
      topGenres: [],
      topLanguages: [],
      topIndustries: [],
      topThemes: [],
      topMoods: [],
      topDirectors: [],
      recentInterests: [],
      avoidedGenres: [],
      profileStrength: 'low',
    };
    return {
      profile: fallbackProfile,
      summary: getFallbackTasteSummary(fallbackProfile),
      isCacheHit: false,
      profileVersion: '0000000000000000',
    };
  }

  const profileVersion = computeProfileVersion(userDoc, reviews, watchlist);
  const provider = options.geminiProvider || defaultGeminiProvider;
  const model = provider?.fastModel || 'gemini-3.5-flash-lite';
  const promptVersion = 'v1';
  const cacheKey = buildCompoundCacheKey(userId, profileVersion, model, promptVersion);

  if (!options.skipCache) {
    const cachedEntry = tasteProfileCache.get(cacheKey);
    if (cachedEntry) {
      return {
        profile: cachedEntry.profile,
        summary: {
          ...cachedEntry.summary,
          source: 'cache',
        },
        isCacheHit: true,
        profileVersion,
      };
    }
  }

  // 1. Build deterministic local profile
  const profile = buildDeterministicTasteProfile({ userDoc, reviews, watchlist, trailerHistory });

  // 2. Cold-start check: If profileStrength is "low", return friendly cold-start immediately with 0 Gemini calls
  if (profile.profileStrength === 'low') {
    const coldSummary = {
      headline: 'Building Your Taste Profile',
      summary: 'Not enough viewing activity yet to build a reliable taste profile. Watch trailers, like movies, or write reviews to personalize your StreamFlix experience.',
      text: 'Not enough viewing activity yet to build a reliable taste profile. Watch trailers, like movies, or write reviews to personalize your StreamFlix experience.',
      highlights: (profile.topGenres || []).slice(0, 3),
      confidence: 'low',
      source: 'cold-start',
      isFallback: false,
    };
    const result = { profile, summary: coldSummary, isCacheHit: false, profileVersion };
    tasteProfileCache.set(cacheKey, result, userId);
    return result;
  }

  // 3. Grounded verbalizer execution
  let summary = null;

  if (options.forceFallback || options.skipLlm || options.forceLlmError) {
    summary = { ...getFallbackTasteSummary(profile), isFallback: true };
  } else if (options.mockGeminiProvider) {
    try {
      const raw = await options.mockGeminiProvider(profile);
      if (typeof raw !== 'object' || raw === null) {
        summary = { ...getFallbackTasteSummary(profile), isFallback: true };
      } else {
        const val = validateTasteProfileSummary(raw, profile);
        if (val.valid) {
          summary = { ...val.sanitized, source: 'llm', isFallback: false };
        } else {
          summary = { ...getFallbackTasteSummary(profile), isFallback: true };
        }
      }
    } catch {
      summary = { ...getFallbackTasteSummary(profile), isFallback: true };
    }
  } else if (!provider || typeof provider.generateStructuredJson !== 'function' || !provider.isConfigured()) {
    summary = { ...getFallbackTasteSummary(profile), isFallback: true };
  } else {
    try {
      const systemPrompt = `You are StreamFlix's personal taste profile verbalizer.
Given a structured deterministic user profile, produce a strictly grounded, engaging summary.
Rules:
1. Provide a punchy 3-7 word headline summarizing their taste.
2. Provide a 1-2 sentence summary strictly grounded in the given profile.
3. Provide up to 3 highlight chips matching entities in the profile.
4. Set confidence to "${profile.profileStrength}".
5. DO NOT invent or infer directors, actors, awards, or psychological motivations not present in the profile.
6. DO NOT include any numerical scores, weights, percentages, or vector terms.
7. Return strictly valid JSON adhering to the required schema.`;

      const userPrompt = `User Profile:
Top Genres: ${profile.topGenres.join(', ') || 'None'}
Top Languages: ${profile.topLanguages.join(', ') || 'None'}
Top Industries: ${profile.topIndustries.join(', ') || 'None'}
Top Themes: ${profile.topThemes.join(', ') || 'None'}
Top Moods: ${profile.topMoods.join(', ') || 'None'}
Top Directors: ${profile.topDirectors.join(', ') || 'None'}
Recent Interests: ${profile.recentInterests.join(', ') || 'None'}
Avoided Genres: ${profile.avoidedGenres.join(', ') || 'None'}
Profile Strength: ${profile.profileStrength}`;

      const geminiRes = await provider.generateStructuredJson(systemPrompt, userPrompt, TASTE_PROFILE_SUMMARY_SCHEMA);

      if (geminiRes?.ok && geminiRes.data) {
        const validation = validateTasteProfileSummary(geminiRes.data, profile);
        if (validation.valid) {
          summary = {
            ...validation.sanitized,
            source: 'llm',
            isFallback: false,
          };
        } else {
          summary = { ...getFallbackTasteSummary(profile), isFallback: true };
        }
      } else {
        summary = { ...getFallbackTasteSummary(profile), isFallback: true };
      }
    } catch {
      summary = { ...getFallbackTasteSummary(profile), isFallback: true };
    }
  }

  // 4. Store in multi-tenant safe cache
  const finalPayload = { profile, summary, isCacheHit: false, profileVersion };
  tasteProfileCache.set(cacheKey, finalPayload, userId);

  return finalPayload;
}
