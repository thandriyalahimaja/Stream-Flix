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
  },
  { timestamps: true }
);

// Full-text search index for title, synopsis, and director fields
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' });

export default mongoose.model('Movie', movieSchema);
