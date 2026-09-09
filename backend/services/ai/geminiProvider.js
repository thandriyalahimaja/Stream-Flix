import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GeminiProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.fastModel = config.fastModel || process.env.GEMINI_FAST_MODEL || 'gemini-3.5-flash-lite';
    this.embeddingModel = config.embeddingModel || process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
    this.timeoutMs = config.timeoutMs || 7000;
    this.maxRetries = config.maxRetries || 1;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Internal helper for resilient fetch with timeout and exponential backoff on transient errors.
   */
  async _fetchWithRetry(url, options = {}, retriesLeft = this.maxRetries) {
    const t0 = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      const latencyMs = parseFloat((performance.now() - t0).toFixed(2));

      if (res.ok) {
        const json = await res.json();
        return { ok: true, json, status: res.status, latencyMs };
      }

      // Retry on 429 (rate limit) or 503 (service unavailable)
      if ((res.status === 429 || res.status === 503) && retriesLeft > 0) {
        await new Promise(r => setTimeout(r, 600));
        return this._fetchWithRetry(url, options, retriesLeft - 1);
      }

      const errorText = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${errorText}`, status: res.status, latencyMs };
    } catch (err) {
      clearTimeout(timer);
      const latencyMs = parseFloat((performance.now() - t0).toFixed(2));
      if (err.name === 'AbortError') {
        return { ok: false, error: `Request timeout after ${this.timeoutMs}ms`, status: 408, latencyMs };
      }
      if (retriesLeft > 0) {
        await new Promise(r => setTimeout(r, 600));
        return this._fetchWithRetry(url, options, retriesLeft - 1);
      }
      return { ok: false, error: err.message, status: 500, latencyMs };
    }
  }

  /**
   * Generate structured JSON extraction from Gemini Fast Model.
   *
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {Object} [jsonSchema]
   * @returns {Promise<{ ok: boolean, data: any, latencyMs: number, error?: string }>}
   */
  async generateStructuredJson(systemPrompt, userPrompt, jsonSchema = null) {
    if (!this.isConfigured()) {
      return { ok: false, error: 'GEMINI_API_KEY is not configured', latencyMs: 0 };
    }

    const url = `${GEMINI_BASE_URL}/models/${this.fastModel}:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    if (jsonSchema) {
      body.generationConfig.responseSchema = jsonSchema;
    }

    const res = await this._fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { ok: false, error: res.error, status: res.status, latencyMs: res.latencyMs };
    }

    try {
      const candidateText = res.json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        return { ok: false, error: 'Empty candidate text from Gemini', latencyMs: res.latencyMs };
      }
      const parsedData = JSON.parse(candidateText);
      return { ok: true, data: parsedData, latencyMs: res.latencyMs };
    } catch (parseErr) {
      return { ok: false, error: `Malformed JSON response: ${parseErr.message}`, latencyMs: res.latencyMs };
    }
  }

  /**
   * Generate query embedding vector using Gemini Embedding Model.
   *
   * @param {string} text
   * @param {number} [outputDimensions=768]
   * @returns {Promise<{ ok: boolean, embedding: number[]|null, latencyMs: number, error?: string }>}
   */
  async generateQueryEmbedding(text, outputDimensions = 768) {
    if (!this.isConfigured()) {
      return { ok: false, embedding: null, error: 'GEMINI_API_KEY is not configured', latencyMs: 0 };
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return { ok: false, embedding: null, error: 'Empty text for embedding', latencyMs: 0 };
    }

    const url = `${GEMINI_BASE_URL}/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;
    const body = {
      model: `models/${this.embeddingModel}`,
      content: {
        parts: [{ text: text.trim() }],
      },
      taskType: 'RETRIEVAL_QUERY',
      outputDimensionality: outputDimensions,
    };

    const res = await this._fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { ok: false, embedding: null, error: res.error, status: res.status, latencyMs: res.latencyMs };
    }

    const values = res.json?.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) {
      return { ok: false, embedding: null, error: 'Missing or empty embedding values in response', latencyMs: res.latencyMs };
    }

    return { ok: true, embedding: values, latencyMs: res.latencyMs };
  }
}

export const defaultGeminiProvider = new GeminiProvider();
