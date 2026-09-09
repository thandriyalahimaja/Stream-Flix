import crypto from 'node:crypto';

/**
 * Normalizes query string before hashing:
 * - trim
 * - lowercase
 * - collapse multiple whitespace to single space
 * - remove extraneous punctuation noise while preserving alphanumerics
 */
export function normalizeQueryString(query) {
  return String(query || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * High-performance in-memory cache for AI Intent Extractions and Query Embeddings.
 * Prevents redundant Gemini API calls and guarantees fast sub-millisecond retrieval on repeat queries.
 */
export class AICache {
  constructor({ maxEntries = 1000, ttlMs = 24 * 60 * 60 * 1000 } = {}) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.intentCache = new Map(); // hash -> { data, cachedAt }
    this.embeddingCache = new Map(); // compositeKey -> { data, cachedAt }
    this.stats = {
      intentHits: 0,
      intentMisses: 0,
      embeddingHits: 0,
      embeddingMisses: 0,
    };
  }

  /**
   * Generates a deterministic SHA-256 hash key from the normalized query string.
   */
  hashQuery(query) {
    const normalized = normalizeQueryString(query);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Generates a versioned cache key for query embeddings.
   * Format: embedding:{normalizedQueryHash}:{model}:{dimensions}:{embeddingVersion}
   */
  buildEmbeddingKey(query, {
    model = 'gemini-embedding-2',
    dimensions = 768,
    embeddingVersion = 'phase3-v1',
  } = {}) {
    const queryHash = this.hashQuery(query);
    return `embedding:${queryHash}:${model}:${dimensions}:${embeddingVersion}`;
  }

  getIntent(query) {
    const key = this.hashQuery(query);
    const entry = this.intentCache.get(key);
    if (!entry) {
      this.stats.intentMisses++;
      return null;
    }
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.intentCache.delete(key);
      this.stats.intentMisses++;
      return null;
    }
    this.stats.intentHits++;
    return entry.data;
  }

  setIntent(query, data) {
    if (!query || !data) return;
    const key = this.hashQuery(query);
    if (this.intentCache.size >= this.maxEntries) {
      const oldestKey = this.intentCache.keys().next().value;
      this.intentCache.delete(oldestKey);
    }
    this.intentCache.set(key, {
      data,
      cachedAt: Date.now(),
    });
  }

  getEmbedding(query, options = {}) {
    const key = this.buildEmbeddingKey(query, options);
    const entry = this.embeddingCache.get(key);
    if (!entry) {
      this.stats.embeddingMisses++;
      return null;
    }
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.embeddingCache.delete(key);
      this.stats.embeddingMisses++;
      return null;
    }
    this.stats.embeddingHits++;
    return entry.data;
  }

  setEmbedding(query, data, options = {}) {
    if (!query || !data) return;
    const key = this.buildEmbeddingKey(query, options);
    if (this.embeddingCache.size >= this.maxEntries) {
      const oldestKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(oldestKey);
    }
    this.embeddingCache.set(key, {
      data,
      cachedAt: Date.now(),
    });
  }

  getStats() {
    const totalIntentRequests = this.stats.intentHits + this.stats.intentMisses;
    const totalEmbeddingRequests = this.stats.embeddingHits + this.stats.embeddingMisses;

    return {
      intentCacheSize: this.intentCache.size,
      embeddingCacheSize: this.embeddingCache.size,
      intentHits: this.stats.intentHits,
      intentMisses: this.stats.intentMisses,
      intentHitRate: totalIntentRequests > 0 ? parseFloat((this.stats.intentHits / totalIntentRequests).toFixed(4)) : 0,
      embeddingHits: this.stats.embeddingHits,
      embeddingMisses: this.stats.embeddingMisses,
      embeddingHitRate: totalEmbeddingRequests > 0 ? parseFloat((this.stats.embeddingHits / totalEmbeddingRequests).toFixed(4)) : 0,
    };
  }

  clear() {
    this.intentCache.clear();
    this.embeddingCache.clear();
    this.stats = {
      intentHits: 0,
      intentMisses: 0,
      embeddingHits: 0,
      embeddingMisses: 0,
    };
  }
}

export const aiCache = new AICache();
