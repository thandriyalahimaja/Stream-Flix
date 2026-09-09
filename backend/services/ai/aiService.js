import { defaultGeminiProvider } from './geminiProvider.js';
import {
  INTENT_JSON_SCHEMA,
  validateAndNormalizeIntent,
  extractFallbackIntent,
} from './intentSchema.js';
import { aiCache } from './aiCache.js';

export class AIService {
  constructor(provider = defaultGeminiProvider, cache = aiCache) {
    this.provider = provider;
    this.cache = cache;
  }

  /**
   * Resolves a reference movie title against the local StreamFlix catalog.
   *
   * @param {string} title
   * @param {Object[]} allMovies
   * @returns {Object|null}
   */
  findReferenceMovie(title, allMovies = []) {
    if (!title || typeof title !== 'string' || !allMovies || allMovies.length === 0) return null;
    const clean = title.trim().toLowerCase();

    // 1. Exact title match
    const exact = allMovies.find(m => m.title && m.title.trim().toLowerCase() === clean);
    if (exact) return exact;

    // 2. Substring match (word boundary or startsWith)
    const substringMatch = allMovies.find(m => {
      if (!m.title) return false;
      const tLower = m.title.trim().toLowerCase();
      return tLower.includes(clean) || clean.includes(tLower);
    });

    return substringMatch || null;
  }

  /**
   * Extract structured movie search intent from natural-language query.
   * Uses in-memory cache, Gemini Fast Model (gemini-3.5-flash-lite), strict validation,
   * and automatic rule-based fallback on failure.
   *
   * @param {string} queryText
   * @returns {Promise<{
   *   originalIntent: Object,
   *   normalizedIntent: Object,
   *   isFallback: boolean,
   *   source: string,
   *   latencyMs: number,
   *   error?: string
   * }>}
   */
  async extractMovieIntent(queryText) {
    const t0 = performance.now();
    const cleanQuery = String(queryText || '').trim();

    if (!cleanQuery) {
      const fallback = extractFallbackIntent('');
      return {
        originalIntent: fallback,
        normalizedIntent: fallback,
        isFallback: true,
        source: 'empty_query',
        latencyMs: 0,
      };
    }

    // 1. Check intent cache
    const cachedIntent = this.cache.getIntent(cleanQuery);
    if (cachedIntent) {
      return {
        originalIntent: cachedIntent.originalIntent,
        normalizedIntent: cachedIntent.normalizedIntent,
        isFallback: false,
        source: 'cache',
        latencyMs: parseFloat((performance.now() - t0).toFixed(2)),
      };
    }

    // 2. Query Gemini structured extraction
    const systemPrompt = `You are a film search query understanding system for StreamFlix.
Analyze the user's natural-language request and extract search intent.
Output ONLY valid JSON strictly conforming to the requested schema.
Do NOT invent constraints that the user did not specify.
Leave fields as empty arrays or null if not explicitly mentioned or clearly implied.`;

    const userPrompt = `Extract search intent for query: "${cleanQuery}"
Return valid JSON matching this schema:
${JSON.stringify(INTENT_JSON_SCHEMA)}`;

    const geminiRes = await this.provider.generateStructuredJson(systemPrompt, userPrompt, INTENT_JSON_SCHEMA);

    if (geminiRes.ok && geminiRes.data) {
      const validated = validateAndNormalizeIntent(geminiRes.data, cleanQuery);
      if (validated.isValid) {
        // Cache valid result
        this.cache.setIntent(cleanQuery, {
          originalIntent: validated.originalIntent,
          normalizedIntent: validated.normalizedIntent,
        });

        return {
          originalIntent: validated.originalIntent,
          normalizedIntent: validated.normalizedIntent,
          isFallback: false,
          source: 'gemini',
          latencyMs: geminiRes.latencyMs,
        };
      }
    }

    // 3. Graceful Rule-Based Fallback
    const fallbackNormalized = extractFallbackIntent(cleanQuery);
    this.cache.setIntent(cleanQuery, {
      originalIntent: geminiRes.data || { rawText: cleanQuery },
      normalizedIntent: fallbackNormalized,
    });
    return {
      originalIntent: geminiRes.data || { rawText: cleanQuery },
      normalizedIntent: fallbackNormalized,
      isFallback: true,
      source: 'rule_based_fallback',
      latencyMs: parseFloat((performance.now() - t0).toFixed(2)),
      error: geminiRes.error || 'Schema validation failure',
    };
  }

  /**
   * Generates a 768-dimensional query embedding vector compatible with the stored movie corpus.
   *
   * @param {string} queryText
   * @param {Object} [normalizedIntent]
   * @returns {Promise<{
   *   embedding: number[]|null,
   *   isFallback: boolean,
   *   source: string,
   *   latencyMs: number,
   *   error?: string
   * }>}
   */
  async embedQuery(queryText, normalizedIntent = null) {
    const t0 = performance.now();
    const cleanQuery = String(queryText || '').trim();

    if (!cleanQuery) {
      return {
        embedding: null,
        isFallback: true,
        source: 'empty_query',
        latencyMs: 0,
      };
    }

    // Build enriched query embedding prompt
    let embeddingText = cleanQuery;
    if (normalizedIntent) {
      const parts = [cleanQuery];
      if (normalizedIntent.genres?.length) parts.push(`Genres: ${normalizedIntent.genres.join(', ')}`);
      if (normalizedIntent.themes?.length) parts.push(`Themes: ${normalizedIntent.themes.join(', ')}`);
      if (normalizedIntent.moods?.length) parts.push(`Mood: ${normalizedIntent.moods.join(', ')}`);
      embeddingText = parts.join(' | ');
    }

    // Cache key options based on configured model & catalog specs
    const cacheOptions = {
      model: this.provider.embeddingModel || 'gemini-embedding-2',
      dimensions: 768,
      embeddingVersion: 'phase3-v1',
    };

    // 1. Check embedding cache (keyed by cleanQuery so repeat identical queries always hit)
    const cachedEmb = this.cache.getEmbedding(cleanQuery, cacheOptions);
    if (cachedEmb) {
      return {
        embedding: cachedEmb,
        isFallback: false,
        source: 'cache',
        latencyMs: parseFloat((performance.now() - t0).toFixed(2)),
      };
    }

    // 2. Call Gemini embedding endpoint
    const res = await this.provider.generateQueryEmbedding(embeddingText, 768);

    if (res.ok && res.embedding) {
      this.cache.setEmbedding(cleanQuery, res.embedding, cacheOptions);
      return {
        embedding: res.embedding,
        isFallback: false,
        source: 'gemini',
        latencyMs: res.latencyMs,
      };
    }

    // 3. Fallback: If live Gemini API fails/times out/rate-limits, synthesize a deterministic normalized vector
    // and cache it so subsequent identical queries hit the cache cleanly and local recommendation runs seamlessly
    const fallbackVector = new Array(768).fill(0);
    const textToHash = embeddingText.toLowerCase().trim();
    for (let i = 0; i < textToHash.length; i++) {
      const idx = (textToHash.charCodeAt(i) * 31 + i * 17) % 768;
      fallbackVector[idx] += 0.1;
    }
    // Normalize fallback vector
    const norm = Math.sqrt(fallbackVector.reduce((sum, v) => sum + v * v, 0)) || 1;
    const normalizedFallbackVector = fallbackVector.map(v => parseFloat((v / norm).toFixed(8)));

    this.cache.setEmbedding(cleanQuery, normalizedFallbackVector, cacheOptions);

    return {
      embedding: normalizedFallbackVector,
      isFallback: true,
      source: 'fallback_embedding',
      latencyMs: parseFloat((performance.now() - t0).toFixed(2)),
      error: res.error,
    };
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

export const aiService = new AIService();
