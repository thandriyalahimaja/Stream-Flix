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
 * Generates a deterministic SHA-256 hash from input string.
 */
export function sha256(str) {
  return crypto.createHash('sha256').update(String(str || '')).digest('hex');
}

/**
 * Multi-Tenant Safe In-Memory LRU/TTL Cache for Movie Explanations.
 *
 * Guarantees strict cross-user data isolation:
 * - Personalized explanations use compound keys containing userId and userContextHash.
 * - Search explanations use normalizedQueryHash and movieId.
 * - Default TTL: 24 hours. Max entries: 2000.
 */
export class ExplanationCache {
  constructor({
    maxEntries = 2000,
    ttlMs = 24 * 60 * 60 * 1000, // 24 hours
    explanationVersion = 'phase5-v1',
    model = 'gemini-3.5-flash-lite',
  } = {}) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.explanationVersion = explanationVersion;
    this.model = model;
    this.cache = new Map(); // key -> { data, cachedAt, lastAccessedAt }
    this.stats = {
      personalizedHits: 0,
      personalizedMisses: 0,
      searchHits: 0,
      searchMisses: 0,
      evictions: 0,
    };
  }

  /**
   * Builds compound SHA-256 key for personalized explanations.
   * Format: sha256('personalized:' + userId + ':' + userContextHash + ':' + movieId + ':' + recContextHash + ':' + version + ':' + model)
   */
  buildPersonalizedKey(userId, userContextHash = '', movieId = '', recContextHash = '') {
    const raw = `personalized:${String(userId)}:${String(userContextHash)}:${String(movieId)}:${String(recContextHash)}:${this.explanationVersion}:${this.model}`;
    return sha256(raw);
  }

  /**
   * Builds compound SHA-256 key for generic search explanations.
   * Format: sha256('search:' + normalizedQueryHash + ':' + movieId + ':' + version + ':' + model)
   */
  buildSearchKey(query, movieId = '') {
    const normQueryHash = sha256(normalizeQueryString(query));
    const raw = `search:${normQueryHash}:${String(movieId)}:${this.explanationVersion}:${this.model}`;
    return sha256(raw);
  }

  get(key) {
    if (!key) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU position by re-inserting
    entry.lastAccessedAt = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key, data) {
    if (!key || !data) return;

    // LRU eviction if full
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
  }

  getPersonalized(userId, userContextHash = '', movieId = '', recContextHash = '') {
    const key = this.buildPersonalizedKey(userId, userContextHash, movieId, recContextHash);
    const data = this.get(key);
    if (data) {
      this.stats.personalizedHits++;
      return data;
    }
    this.stats.personalizedMisses++;
    return null;
  }

  setPersonalized(userId, userContextHash = '', movieId = '', recContextHash = '', data = null) {
    if (!userId || !movieId || !data) return;
    const key = this.buildPersonalizedKey(userId, userContextHash, movieId, recContextHash);
    this.set(key, data);
  }

  getSearch(query, movieId = '') {
    const key = this.buildSearchKey(query, movieId);
    const data = this.get(key);
    if (data) {
      this.stats.searchHits++;
      return data;
    }
    this.stats.searchMisses++;
    return null;
  }

  setSearch(query, movieId = '', data = null) {
    if (!query || !movieId || !data) return;
    const key = this.buildSearchKey(query, movieId);
    this.set(key, data);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.stats = {
      personalizedHits: 0,
      personalizedMisses: 0,
      searchHits: 0,
      searchMisses: 0,
      evictions: 0,
    };
  }

  getStats() {
    const totalHits = this.stats.personalizedHits + this.stats.searchHits;
    const totalMisses = this.stats.personalizedMisses + this.stats.searchMisses;
    const totalRequests = totalHits + totalMisses;

    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      ttlMs: this.ttlMs,
      personalizedHits: this.stats.personalizedHits,
      personalizedMisses: this.stats.personalizedMisses,
      searchHits: this.stats.searchHits,
      searchMisses: this.stats.searchMisses,
      totalHits,
      totalMisses,
      hitRate: totalRequests > 0 ? parseFloat((totalHits / totalRequests).toFixed(4)) : 0,
      evictions: this.stats.evictions,
    };
  }
}

export const explanationCache = new ExplanationCache();
