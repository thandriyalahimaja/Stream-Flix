import mongoose from 'mongoose';

/**
 * Sub-schema for Cloudinary media assets (images and videos).
 * `url` is the CDN URL; `publicId` is needed for Cloudinary delete/replace operations.
 */
const mediaSchema = {
  url: { type: String, default: null },
  publicId: { type: String, default: null },
};

/**
 * Movie schema — represents a film in the StreamFlix catalog.
 *
 * Media fields:
 *   - poster    → Cloudinary image (uploaded via admin panel)
 *   - backdrop  → Cloudinary wide image for hero sections
 *   - youtubeId → YouTube video ID (e.g. "dQw4w9WgXcQ") for iframe trailer embedding
 *
 * Engagement fields are maintained by user interaction endpoints:
 *   - views  → incremented when a user opens the movie detail page
 *   - likes / dislikes → toggled by authenticated users
 *   - avgUserRating / reviewCount → recalculated after every review submission or deletion
 */
const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    year: { type: Number, required: true, index: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    duration: { type: String, required: true },
    genres: { type: [String], required: true, index: true },

    // Cloudinary-hosted media
    poster: { type: mediaSchema, default: () => ({}) },
    backdrop: { type: mediaSchema, default: () => ({}) },

    // YouTube trailer (ID only — frontend builds the embed URL)
    youtubeId: { type: String, default: null },

    synopsis: { type: String, required: true },
    cast: [{ type: String }],
    director: { type: String, required: true },

    // Optional label shown on movie cards (e.g. "Hidden Gem", "Top Pick")
    smartLabel: { type: String, default: '' },

    // Engagement counters
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },

    // Computed from submitted reviews
    reviewCount: { type: Number, default: 0 },
    avgUserRating: { type: Number, default: 0 },

    // Stable Identifiers
    imdbId: { type: String, default: null, sparse: true, index: true },
    tmdbId: { type: Number, default: null, sparse: true, index: true },

    // Linguistic & Regional Metadata
    language: { type: String, default: null, index: true },
    languageName: { type: String, default: null },
    industry: { type: String, default: null, index: true },

    // Semantic Plot & Theme Tags
    keywords: [{ type: String }],
    themes: [{ type: String }],
    moods: [{ type: String }],

    // Vector Embeddings (768 dimensions for Gemini Embedding 2)
    embedding: {
      type: [Number],
      default: undefined,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional for historical/non-embedded films
          if (!Array.isArray(v)) return false;
          if (v.length !== 768) return false;
          return v.every((n) => typeof n === 'number' && Number.isFinite(n));
        },
        message: 'Embedding must be an array of exactly 768 finite numbers',
      },
    },
    embeddingModel: { type: String, default: null },
    embeddingDimensions: { type: Number, default: null },
    embeddingVersion: { type: String, default: null },
    embeddingText: { type: String, default: null },

    // Quality & Algorithmic Scoring Metadata
    qualityScore: { type: Number, default: null },
    weightedRating: { type: Number, default: null },
    qualityTier: { type: String, default: null },
    voteCount: { type: Number, default: null },
    popularity: { type: Number, default: null },

    // Enriched Trailer Metadata
    trailer: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Full-text search index for title, synopsis, and director fields
// language_override: 'none' prevents MongoDB text search from trying to use Indian language codes (te, kn, ta, ml) as stemmers
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' }, { language_override: 'none' });

export default mongoose.model('Movie', movieSchema);
