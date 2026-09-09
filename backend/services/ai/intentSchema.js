/**
 * Canonical dictionaries and strict validation rules for StreamFlix AI Intent Extraction.
 */

export const CANONICAL_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Science Fiction',
  'Sport',
  'Thriller',
  'War',
  'Western',
];

export const GENRE_ALIAS_MAP = {
  'sci-fi': 'Sci-Fi',
  'scifi': 'Sci-Fi',
  'science fiction': 'Sci-Fi',
  'science-fiction': 'Sci-Fi',
  'sports': 'Sport',
  'sport': 'Sport',
  'musicals': 'Musical',
  'musical': 'Musical',
  'rom-com': 'Romance',
  'romcom': 'Romance',
  'romantic comedy': 'Romance',
  'doc': 'Documentary',
  'documentary': 'Documentary',
  'bio': 'Biography',
  'biopic': 'Biography',
  'biography': 'Biography',
  'action thriller': 'Thriller',
  'psychological thriller': 'Thriller',
  'crime thriller': 'Thriller',
  'investigation': 'Mystery',
};

export const CANONICAL_LANGUAGES = {
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  hi: 'Hindi',
  en: 'English',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
};

export const LANGUAGE_ALIAS_MAP = {
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
  english: 'en',
  en: 'en',
  bengali: 'bn',
  bn: 'bn',
  marathi: 'mr',
  mr: 'mr',
  gujarati: 'gu',
  gu: 'gu',
  punjabi: 'pa',
  pa: 'pa',
  tollywood: 'te',
  kollywood: 'ta',
  mollywood: 'ml',
  sandalwood: 'kn',
  bollywood: 'hi',
  hollywood: 'en',
};

export const CANONICAL_INDUSTRIES = [
  'Tollywood',
  'Kollywood',
  'Mollywood',
  'Bollywood',
  'Sandalwood',
  'Hollywood',
];

export const INTENT_JSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    referenceMovies: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Specific movie titles mentioned as reference (e.g. "Ratsasan", "Dangal")',
    },
    genres: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Standard genres explicitly mentioned or strongly implied',
    },
    themes: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Thematic elements such as "revenge", "father-daughter", "underdog", "investigation"',
    },
    moods: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Atmospheric tone such as "dark", "emotional", "lighthearted", "gritty", "suspenseful"',
    },
    languages: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Specific language names or codes (Telugu, Tamil, Malayalam, Kannada, Hindi, English, te, ta, ml, kn, hi, en)',
    },
    industries: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Film industries mentioned (Tollywood, Kollywood, Mollywood, Bollywood)',
    },
    directors: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Director names mentioned in query',
    },
    actors: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Actor names mentioned in query',
    },
    runtimeMinMinutes: {
      type: 'INTEGER',
      nullable: true,
      description: 'Minimum runtime in minutes',
    },
    runtimeMaxMinutes: {
      type: 'INTEGER',
      nullable: true,
      description: 'Maximum runtime in minutes (e.g. "under 2 hours" -> 120)',
    },
    releaseYearMin: {
      type: 'INTEGER',
      nullable: true,
      description: 'Earliest release year (e.g. "since 2015" -> 2015)',
    },
    releaseYearMax: {
      type: 'INTEGER',
      nullable: true,
      description: 'Latest release year (e.g. "90s" -> 1999)',
    },
    ratingMin: {
      type: 'NUMBER',
      nullable: true,
      description: 'Minimum rating (0.0 - 10.0) if explicitly requested',
    },
    exclusions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Negative constraints or genres to exclude (e.g. "no romance", "less violent")',
    },
    noveltyPreference: {
      type: 'STRING',
      nullable: true,
      description: 'Preference for underrated gems vs popular blockbusters (hidden_gem or popular)',
    },
    queryText: {
      type: 'STRING',
      description: 'Echo of the original query text',
    },
  },
  required: [
    'referenceMovies',
    'genres',
    'themes',
    'moods',
    'languages',
    'industries',
    'directors',
    'actors',
    'exclusions',
    'queryText',
  ],
};

/**
 * Creates an empty default intent structure.
 */
export function createDefaultIntent(queryText = '') {
  return {
    referenceMovies: [],
    genres: [],
    themes: [],
    moods: [],
    languages: [],
    industries: [],
    directors: [],
    actors: [],
    runtimeMinMinutes: null,
    runtimeMaxMinutes: null,
    releaseYearMin: null,
    releaseYearMax: null,
    ratingMin: null,
    exclusions: [],
    noveltyPreference: null,
    queryText: String(queryText || '').trim(),
  };
}

/**
 * Validates and normalizes raw intent object from AI or fallback into StreamFlix canonical representation.
 *
 * @param {Object} raw
 * @param {string} queryText
 * @returns {{ isValid: boolean, originalIntent: Object, normalizedIntent: Object, validationErrors: string[] }}
 */
export function validateAndNormalizeIntent(raw, queryText = '') {
  const errors = [];
  const normalized = createDefaultIntent(queryText);

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      isValid: false,
      originalIntent: raw || null,
      normalizedIntent: normalized,
      validationErrors: ['Raw intent is null or not a valid object.'],
    };
  }

  // 1. Reference Movies
  if (Array.isArray(raw.referenceMovies)) {
    normalized.referenceMovies = raw.referenceMovies
      .filter(m => typeof m === 'string' && m.trim().length > 0)
      .map(m => m.trim());
  }

  // 2. Genres Normalization
  if (Array.isArray(raw.genres)) {
    const normGenres = new Set();
    raw.genres.forEach(g => {
      if (typeof g !== 'string') return;
      const clean = g.trim().toLowerCase();
      if (GENRE_ALIAS_MAP[clean]) {
        normGenres.add(GENRE_ALIAS_MAP[clean]);
      } else {
        const matched = CANONICAL_GENRES.find(cg => cg.toLowerCase() === clean);
        if (matched) normGenres.add(matched);
      }
    });
    normalized.genres = Array.from(normGenres);
  }

  // 3. Languages Normalization
  if (Array.isArray(raw.languages)) {
    const normLangs = new Set();
    raw.languages.forEach(l => {
      if (typeof l !== 'string') return;
      const clean = l.trim().toLowerCase();
      if (clean === 'south indian' || clean === 'south india') {
        normLangs.add('te');
        normLangs.add('ta');
        normLangs.add('ml');
        normLangs.add('kn');
      } else if (LANGUAGE_ALIAS_MAP[clean]) {
        normLangs.add(LANGUAGE_ALIAS_MAP[clean]);
      } else if (CANONICAL_LANGUAGES[clean]) {
        normLangs.add(clean);
      }
    });
    normalized.languages = Array.from(normLangs);
  }

  // 4. Industries Normalization
  if (Array.isArray(raw.industries)) {
    const normInd = new Set();
    raw.industries.forEach(ind => {
      if (typeof ind !== 'string') return;
      const clean = ind.trim().toLowerCase();
      const matched = CANONICAL_INDUSTRIES.find(ci => ci.toLowerCase() === clean);
      if (matched) {
        normInd.add(matched);
        // Map industry to language if language wasn't explicitly populated
        if (LANGUAGE_ALIAS_MAP[clean] && !normalized.languages.includes(LANGUAGE_ALIAS_MAP[clean])) {
          normalized.languages.push(LANGUAGE_ALIAS_MAP[clean]);
        }
      }
    });
    normalized.industries = Array.from(normInd);
  }

  // 5. Themes and Moods
  if (Array.isArray(raw.themes)) {
    normalized.themes = raw.themes
      .filter(t => typeof t === 'string' && t.trim().length > 0)
      .map(t => t.trim().toLowerCase());
  }

  if (Array.isArray(raw.moods)) {
    normalized.moods = raw.moods
      .filter(m => typeof m === 'string' && m.trim().length > 0)
      .map(m => m.trim().toLowerCase());
  }

  // 6. Directors & Actors
  if (Array.isArray(raw.directors)) {
    normalized.directors = raw.directors
      .filter(d => typeof d === 'string' && d.trim().length > 0)
      .map(d => d.trim());
  }
  if (Array.isArray(raw.actors)) {
    normalized.actors = raw.actors
      .filter(a => typeof a === 'string' && a.trim().length > 0)
      .map(a => a.trim());
  }

  // 7. Numeric Ranges & Sanity Validation
  const nowYear = new Date().getFullYear();

  if (raw.runtimeMinMinutes !== null && raw.runtimeMinMinutes !== undefined) {
    const minM = Number(raw.runtimeMinMinutes);
    if (!isNaN(minM) && minM >= 10 && minM <= 360) {
      normalized.runtimeMinMinutes = minM;
    } else {
      errors.push(`Invalid runtimeMinMinutes: ${raw.runtimeMinMinutes}`);
    }
  }

  if (raw.runtimeMaxMinutes !== null && raw.runtimeMaxMinutes !== undefined) {
    const maxM = Number(raw.runtimeMaxMinutes);
    if (!isNaN(maxM) && maxM >= 10 && maxM <= 360) {
      normalized.runtimeMaxMinutes = maxM;
    } else {
      errors.push(`Invalid runtimeMaxMinutes: ${raw.runtimeMaxMinutes}`);
    }
  }

  if (
    normalized.runtimeMinMinutes !== null &&
    normalized.runtimeMaxMinutes !== null &&
    normalized.runtimeMinMinutes > normalized.runtimeMaxMinutes
  ) {
    errors.push('runtimeMinMinutes cannot be greater than runtimeMaxMinutes');
    normalized.runtimeMinMinutes = null;
    normalized.runtimeMaxMinutes = null;
  }

  if (raw.releaseYearMin !== null && raw.releaseYearMin !== undefined) {
    const yMin = Number(raw.releaseYearMin);
    if (!isNaN(yMin) && yMin >= 1900 && yMin <= nowYear + 2) {
      normalized.releaseYearMin = yMin;
    } else {
      errors.push(`Invalid releaseYearMin: ${raw.releaseYearMin}`);
    }
  }

  if (raw.releaseYearMax !== null && raw.releaseYearMax !== undefined) {
    const yMax = Number(raw.releaseYearMax);
    if (!isNaN(yMax) && yMax >= 1900 && yMax <= nowYear + 2) {
      normalized.releaseYearMax = yMax;
    } else {
      errors.push(`Invalid releaseYearMax: ${raw.releaseYearMax}`);
    }
  }

  if (
    normalized.releaseYearMin !== null &&
    normalized.releaseYearMax !== null &&
    normalized.releaseYearMin > normalized.releaseYearMax
  ) {
    errors.push('releaseYearMin cannot be greater than releaseYearMax');
    normalized.releaseYearMin = null;
    normalized.releaseYearMax = null;
  }

  if (raw.ratingMin !== null && raw.ratingMin !== undefined) {
    const rMin = Number(raw.ratingMin);
    if (!isNaN(rMin) && rMin >= 0 && rMin <= 10) {
      normalized.ratingMin = rMin;
    } else {
      errors.push(`Invalid ratingMin: ${raw.ratingMin}`);
    }
  }

  // 8. Exclusions
  if (Array.isArray(raw.exclusions)) {
    normalized.exclusions = raw.exclusions
      .filter(x => typeof x === 'string' && x.trim().length > 0)
      .map(x => x.trim());
  }

  // 9. Novelty Preference
  if (raw.noveltyPreference === 'hidden_gem' || raw.noveltyPreference === 'popular') {
    normalized.noveltyPreference = raw.noveltyPreference;
  }

  normalized.queryText = String(queryText || raw.queryText || '').trim();

  return {
    isValid: errors.length === 0,
    originalIntent: raw,
    normalizedIntent: normalized,
    validationErrors: errors,
  };
}

/**
 * Deterministic rule-based fallback intent extractor for zero-downtime offline continuity.
 * Extracts intent via keyword patterns and regular expressions when Gemini is offline.
 *
 * @param {string} queryText
 * @returns {Object} Validated and normalized intent
 */
export function extractFallbackIntent(queryText = '') {
  const q = String(queryText || '').toLowerCase().trim();
  const intent = createDefaultIntent(queryText);

  if (!q) return intent;

  // 1. Check for reference movie patterns ("like Ratsasan", "similar to Dangal", "like RRR and Baahubali")
  const refPattern = /(?:like|similar to|in the style of)\s+([a-zA-Z0-9\s:'-]+?)(?:\s+(?:but|with|without|from|under|in)|\s*$)/i;
  const refMatches = q.match(refPattern);
  if (refMatches && refMatches[1]) {
    const rawRefs = refMatches[1].split(/\s+and\s+|,\s*/i);
    for (const ref of rawRefs) {
      const refTitle = ref.trim();
      if (refTitle.length > 2 && !intent.referenceMovies.includes(refTitle)) {
        intent.referenceMovies.push(refTitle);
      }
    }
  }

  // 2. Languages / Regions
  if (q.includes('telugu') || q.includes('tollywood')) intent.languages.push('te');
  if (q.includes('tamil') || q.includes('kollywood')) intent.languages.push('ta');
  if (q.includes('malayalam') || q.includes('mollywood')) intent.languages.push('ml');
  if (q.includes('kannada') || q.includes('sandalwood')) intent.languages.push('kn');
  if (q.includes('hindi') || q.includes('bollywood')) intent.languages.push('hi');
  if (q.includes('english') || q.includes('hollywood')) intent.languages.push('en');
  if (q.includes('south indian') || q.includes('south india')) {
    ['te', 'ta', 'ml', 'kn'].forEach(l => {
      if (!intent.languages.includes(l)) intent.languages.push(l);
    });
  }

  // 3. Genres
  CANONICAL_GENRES.forEach(genre => {
    const gLower = genre.toLowerCase();
    if (q.includes(gLower) && !intent.genres.includes(genre)) {
      intent.genres.push(genre);
    }
  });

  // Alias checks
  if (q.includes('sci-fi') || q.includes('science fiction') || q.includes('scifi')) {
    if (!intent.genres.includes('Sci-Fi')) intent.genres.push('Sci-Fi');
  }
  if (q.includes('sports') || q.includes('sport')) {
    if (!intent.genres.includes('Sport')) intent.genres.push('Sport');
  }
  if (q.includes('romcom') || q.includes('rom-com') || q.includes('romantic comedy')) {
    if (!intent.genres.includes('Comedy')) intent.genres.push('Comedy');
    if (!intent.genres.includes('Romance')) intent.genres.push('Romance');
  }

  // 4. Moods & Themes
  const moodWords = ['dark', 'emotional', 'funny', 'gritty', 'lighthearted', 'feel-good', 'suspenseful', 'intense', 'scary', 'inspirational'];
  moodWords.forEach(m => {
    if (q.includes(m)) intent.moods.push(m);
  });

  const themeWords = ['investigation', 'revenge', 'father', 'family', 'underdog', 'psychological', 'heist', 'gangster', 'police', 'courtroom', 'politics'];
  themeWords.forEach(t => {
    if (q.includes(t)) intent.themes.push(t);
  });

  // 5. Runtime (e.g. "under 2 hours", "less than 90 minutes", "under 120 min")
  const hourMatch = q.match(/under\s+(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)/i) || q.match(/less than\s+(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)/i);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    intent.runtimeMaxMinutes = Math.round(hours * 60);
  }

  const minMatch = q.match(/under\s+(\d+)\s*(?:min|mins|minute|minutes)/i) || q.match(/less than\s+(\d+)\s*(?:min|mins|minute|minutes)/i);
  if (minMatch) {
    intent.runtimeMaxMinutes = parseInt(minMatch[1], 10);
  }

  // 6. Exclusions (e.g. "no romance", "without violence", "not scary", "less violent")
  const excludeMatch = q.match(/(?:no|without|not)\s+([a-z]+)/i);
  if (excludeMatch && excludeMatch[1]) {
    const exWord = excludeMatch[1].toLowerCase();
    if (exWord === 'romance' || exWord === 'romantic') intent.exclusions.push('Romance');
    else if (exWord === 'horror' || exWord === 'scary') intent.exclusions.push('Horror');
    else if (exWord === 'action' || exWord === 'violence' || exWord === 'violent') intent.exclusions.push('Action');
    else intent.exclusions.push(exWord);
  }
  if (q.includes('less violent')) {
    intent.exclusions.push('Violence');
  }

  // 7. Novelty
  if (q.includes('hidden gem') || q.includes('underrated')) {
    intent.noveltyPreference = 'hidden_gem';
  } else if (q.includes('popular') || q.includes('blockbuster') || q.includes('famous')) {
    intent.noveltyPreference = 'popular';
  }

  const { normalizedIntent } = validateAndNormalizeIntent(intent, queryText);
  return normalizedIntent;
}
