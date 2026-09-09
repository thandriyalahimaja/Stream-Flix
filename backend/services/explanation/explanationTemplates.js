/**
 * Language display name mapping for Indian and international languages.
 */
export const LANGUAGE_NAMES = {
  te: 'Telugu',
  ta: 'Tamil',
  hi: 'Hindi',
  en: 'English',
  ml: 'Malayalam',
  kn: 'Kannada',
  es: 'Spanish',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  de: 'German',
  zh: 'Mandarin',
  it: 'Italian',
};

export function formatLanguage(code) {
  if (!code) return '';
  const clean = String(code).toLowerCase().trim();
  return LANGUAGE_NAMES[clean] || (clean.charAt(0).toUpperCase() + clean.slice(1));
}

/**
 * 8 Deterministic Rule Templates for Zero-LLM Fallback & Resilience.
 *
 * Guaranteed to produce grounded, hallucination-free explanations with zero external LLM calls.
 * Public format: { headline, reason, evidence (max 3 chips), confidence, source, isFallback: true }.
 */
export const DETERMINISTIC_TEMPLATES = {
  // 1. Reference Movie Match
  reference_movie: (evidence) => {
    const ref = evidence.referenceMovie || 'similar titles';
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: `Similar to ${ref}`,
      reason: `Recommended because you enjoy films like ${ref}, sharing a similar narrative tone and dynamic pacing.`,
      evidence: chips.length > 0 ? chips : [ref, 'Similar Tone'],
      confidence: 'high',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'reference_movie',
    };
  },

  // 2. Theme Match
  theme: (evidence) => {
    const themeName = (evidence.matchedThemes || [])[0] || 'thematic';
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: `Compelling ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Storytelling`,
      reason: `Selected because it explores compelling ${themeName} themes that strongly align with your viewing interests.`,
      evidence: chips.length > 0 ? chips : [themeName],
      confidence: 'high',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'theme',
    };
  },

  // 3. Genre Match
  genre: (evidence) => {
    const genres = (evidence.matchedGenres || []);
    const genreStr = genres.slice(0, 2).join(' & ') || 'top genres';
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: `Matches Your ${genreStr} Preference`,
      reason: `Recommended because you enjoy ${genreStr}, and ${evidence.movieTitle || 'this film'} delivers standout storytelling in this genre.`,
      evidence: chips.length > 0 ? chips : genres.slice(0, 3),
      confidence: 'high',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'genre',
    };
  },

  // 4. Language Match
  language: (evidence) => {
    const langCode = (evidence.matchedLanguages || [])[0];
    const langName = formatLanguage(langCode) || 'Regional';
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: `${langName} Cinema Spotlight`,
      reason: `Matches your interest in ${langName} cinema, featuring acclaimed performances and authentic local storytelling.`,
      evidence: chips.length > 0 ? chips : [langName],
      confidence: 'medium',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'language',
    };
  },

  // 5. Runtime Match
  runtime: (evidence) => {
    const runtimeDesc = evidence.runtimeMatch || 'convenient';
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: 'Fits Your Viewing Time',
      reason: `Selected to match your preferred viewing length with a ${runtimeDesc} runtime that fits your schedule.`,
      evidence: chips.length > 0 ? chips : ['Ideal Runtime'],
      confidence: 'medium',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'runtime',
    };
  },

  // 6. Semantic Match
  semantic: (evidence) => {
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: 'Tailored to Your Taste Profile',
      reason: `Shares narrative depth, atmosphere, and thematic resonance with titles you have previously enjoyed.`,
      evidence: chips.length > 0 ? chips : ['Taste Match'],
      confidence: 'high',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'semantic',
    };
  },

  // 7. Quality Match
  quality: (evidence) => {
    const rating = evidence.qualitySignal?.rating ? `${evidence.qualitySignal.rating}★` : 'top-rated';
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: 'Critically Acclaimed Selection',
      reason: `Recognized for high quality with a ${rating} audience rating, making it a reliable and engaging watch.`,
      evidence: chips.length > 0 ? chips : ['Critically Acclaimed'],
      confidence: 'high',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'quality',
    };
  },

  // 8. Novelty / Hidden Gem Match
  novelty: (evidence) => {
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    const hasGem = chips.includes('Hidden Gem');
    return {
      headline: 'Hidden Gem Selection',
      reason: `An exceptional discovery (${evidence.qualitySignal?.rating || '8.0'}★) with outstanding viewer appreciation that brings a fresh perspective to your watchlist.`,
      evidence: hasGem ? chips : ['Hidden Gem', ...chips].slice(0, 3),
      confidence: 'medium',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'novelty',
    };
  },

  // 9. Cold Start Match
  cold_start: (evidence) => {
    const chips = (evidence.controlledChipVocabulary || []).slice(0, 3);
    return {
      headline: 'Popular StreamFlix Essential',
      reason: `A widely acclaimed catalog highlight chosen to introduce you to premier storytelling on StreamFlix.`,
      evidence: chips.length > 0 ? chips : ['Trending Favorite'],
      confidence: 'medium',
      source: 'fallback_template',
      isFallback: true,
      templateType: 'cold_start',
    };
  },
};

/**
 * Select and evaluate the most specific deterministic template for the given evidence.
 *
 * @param {Object} evidence
 * @returns {Object} Public explanation payload
 */
export function getFallbackExplanation(evidence = {}) {
  // Determine template category by specificity
  let category = 'cold_start';

  if (evidence.referenceMovie) {
    category = 'reference_movie';
  } else if (evidence.noveltySignal?.isDiscoveryGem) {
    category = 'novelty';
  } else if (Array.isArray(evidence.matchedThemes) && evidence.matchedThemes.length > 0) {
    category = 'theme';
  } else if (Array.isArray(evidence.matchedGenres) && evidence.matchedGenres.length > 0) {
    category = 'genre';
  } else if (Array.isArray(evidence.matchedLanguages) && evidence.matchedLanguages.length > 0) {
    category = 'language';
  } else if (evidence.runtimeMatch) {
    category = 'runtime';
  } else if (evidence.semanticMatch) {
    category = 'semantic';
  } else if (evidence.qualitySignal?.isHighRated) {
    category = 'quality';
  }

  const templateFn = DETERMINISTIC_TEMPLATES[category] || DETERMINISTIC_TEMPLATES.cold_start;
  const result = templateFn(evidence);

  // Guarantee max 3 chips and valid array
  result.evidence = Array.isArray(result.evidence) ? result.evidence.slice(0, 3) : [];
  result.movieId = evidence.movieId || null;

  return result;
}
