import { defaultGeminiProvider } from '../ai/geminiProvider.js';
import { evidenceBuilder } from './evidenceBuilder.js';
import { explanationCache } from './explanationCache.js';
import { validateExplanation } from './explanationValidator.js';
import { getFallbackExplanation } from './explanationTemplates.js';

export const EXPLANATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    reason: { type: 'string' },
    evidence: {
      type: 'array',
      items: { type: 'string' },
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
    },
  },
  required: ['headline', 'reason', 'evidence', 'confidence'],
};

export const GROUNDING_SYSTEM_INSTRUCTION = `You are a factual movie recommendation verbalizer for StreamFlix.
Explain why a movie matches the user's taste or search query strictly using the provided backend evidence object.

STRICT GROUNDING RULES:
1. Base your explanation ONLY on the provided evidence object.
2. NEVER invent, hallucinate, or assume facts not in the evidence: do not invent actors, directors, release dates, awards, box office numbers, streaming platforms, or unverified user preferences.
3. The reason must be concise, exactly 1 to 2 sentences.
4. The headline must be punchy (under 8 words).
5. The evidence array MUST contain ONLY items chosen from the controlledChipVocabulary provided in the evidence object. Select at most 3 chips. Do NOT invent chips.
6. Never mention internal algorithms, raw numerical weights, or continuous scores (e.g. semanticScore, hybridScore, qualityScore).`;

/**
 * Grounding & Explainability Engine (Phase 5)
 *
 * Provides on-demand, factual verbalization of recommendation signals with strict grounding,
 * controlled vocabulary validation, multi-tenant cache isolation, and zero-LLM deterministic fallback.
 */
export class ExplanationEngine {
  constructor({
    provider = defaultGeminiProvider,
    cache = explanationCache,
    builder = evidenceBuilder,
  } = {}) {
    this.provider = provider;
    this.cache = cache;
    this.builder = builder;
  }

  /**
   * Generates a grounded explanation for a movie recommendation.
   *
   * @param {Object} params
   * @param {string|Object} params.movieId - Movie ID or Movie Object
   * @param {string} [params.contextType='personalized'] - 'personalized' | 'search'
   * @param {string} [params.query] - Search query (for search context)
   * @param {string|Object} [params.user] - User ID or Authenticated user object
   * @param {Object} [params.movieDoc] - Pre-loaded movie doc if available
   * @param {Object} [params.intent] - Pre-extracted intent if available
   * @param {Object} [params.recommenderSignals] - Diagnostic signals from recommender
   * @returns {Promise<{
   *   movieId: string,
   *   headline: string,
   *   reason: string,
   *   evidence: string[],
   *   confidence: 'high'|'medium'|'low',
   *   source: 'gemini'|'cache'|'fallback_template',
   *   isFallback: boolean,
   *   latencyMs: number,
   *   error?: string
   * }>}
   */
  async explainRecommendation({
    movieId,
    contextType = 'personalized',
    query = '',
    user = null,
    movieDoc = null,
    intent = null,
    recommenderSignals = null,
  }) {
    const t0 = performance.now();
    const resolvedMovieId = String(movieDoc?._id || movieDoc?.id || movieId?._id || movieId?.id || movieId || '');

    // Fast Cache Check for Search Context (Zero-LLM, Zero-Intent extraction)
    if (contextType === 'search' && query && resolvedMovieId) {
      const cached = this.cache.getSearch(query, resolvedMovieId);
      if (cached) {
        const latencyMs = parseFloat((performance.now() - t0).toFixed(2));
        return {
          ...cached,
          movieId: resolvedMovieId,
          source: 'cache',
          isFallback: false,
          latencyMs,
        };
      }
    }

    // 1. Authoritative Evidence Reconstruction
    const targetMovie = movieDoc || movieId;
    const evidence = await this.builder.buildEvidence({
      movie: targetMovie,
      contextType,
      query,
      user,
      intent,
      recommenderSignals,
    });

    const mId = String(evidence.movieId || resolvedMovieId);
    const userId = user?.id || user?._id || (typeof user === 'string' ? user : 'anonymous');

    // 2. Multi-Tenant Safe Cache Resolution
    if (contextType === 'personalized') {
      const cached = this.cache.getPersonalized(userId, evidence.userContextHash, mId, evidence.recContextHash);
      if (cached) {
        const latencyMs = parseFloat((performance.now() - t0).toFixed(2));
        return {
          ...cached,
          movieId: mId,
          source: 'cache',
          isFallback: false,
          latencyMs,
        };
      }
    } else {
      const cached = this.cache.getSearch(query, mId);
      if (cached) {
        const latencyMs = parseFloat((performance.now() - t0).toFixed(2));
        return {
          ...cached,
          movieId: mId,
          source: 'cache',
          isFallback: false,
          latencyMs,
        };
      }
    }

    // 3. Deterministic Fallback if Gemini is not configured
    if (!this.provider.isConfigured()) {
      const fallback = getFallbackExplanation(evidence);
      const latencyMs = parseFloat((performance.now() - t0).toFixed(2));
      return {
        ...fallback,
        movieId: mId,
        latencyMs,
      };
    }

    // 4. Grounded Gemini Verbalization (Fast Model)
    // Prepare grounded user prompt passing ONLY factual evidence
    const userPrompt = `Explain why the movie "${evidence.movieTitle}" matches the request.
VERIFIED BACKEND EVIDENCE:
${JSON.stringify({
  title: evidence.movieTitle,
  year: evidence.year,
  contextType: evidence.contextType,
  matchedGenres: evidence.matchedGenres,
  matchedLanguages: evidence.matchedLanguages,
  matchedThemes: evidence.matchedThemes,
  matchedMoods: evidence.matchedMoods,
  matchedDirector: evidence.matchedDirector,
  matchedActors: evidence.matchedActors,
  runtimeMatch: evidence.runtimeMatch,
  referenceMovie: evidence.referenceMovie,
  qualitySignal: evidence.qualitySignal,
  noveltySignal: evidence.noveltySignal,
  controlledChipVocabulary: evidence.controlledChipVocabulary,
}, null, 2)}

Return strictly valid JSON conforming to the schema. Select at most 3 chips from controlledChipVocabulary.`;

    const geminiRes = await this.provider.generateStructuredJson(
      GROUNDING_SYSTEM_INSTRUCTION,
      userPrompt,
      EXPLANATION_JSON_SCHEMA
    );

    // 5. Post-Generation Grounding and Chip Vocabulary Validation
    if (geminiRes.ok && geminiRes.data) {
      const validation = validateExplanation(geminiRes.data, evidence, targetMovie);

      if (validation.isValid && validation.sanitized) {
        const result = {
          movieId: mId,
          headline: validation.sanitized.headline,
          reason: validation.sanitized.reason,
          evidence: validation.sanitized.evidence,
          confidence: validation.sanitized.confidence,
          source: 'gemini',
          isFallback: false,
          latencyMs: geminiRes.latencyMs,
        };

        // Cache valid explanation
        if (contextType === 'personalized') {
          this.cache.setPersonalized(userId, evidence.userContextHash, mId, evidence.recContextHash, result);
        } else {
          this.cache.setSearch(query, mId, result);
        }

        return result;
      }
    }

    // 6. Resilient Fallback Execution on Failure / Rejection / Rate Limits
    const fallback = getFallbackExplanation(evidence);
    const latencyMs = parseFloat((performance.now() - t0).toFixed(2));

    return {
      ...fallback,
      movieId: mId,
      latencyMs,
      error: geminiRes.error || 'Validation failure',
    };
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

export const explanationEngine = new ExplanationEngine();
