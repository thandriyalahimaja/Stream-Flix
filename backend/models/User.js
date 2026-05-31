import mongoose from 'mongoose';

const mediaSchema = {
  url: { type: String, default: null },
  publicId: { type: String, default: null },
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: mediaSchema, default: () => ({}) },
  preferences: {
    genres: [String],
    theme: { type: String, enum: ['cream', 'berry'], default: 'cream' },
    autoplayTrailers: { type: Boolean, default: true },
    subtitleLang: { type: String, default: 'English' },
    quality: { type: String, default: '4K HDR' },
  },
  watchHistory: [{
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    watchedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  }],
  likedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  dislikedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  refreshToken: { type: String, select: false },
}, { timestamps: true });

// Virtual: total watch time (rough estimate — 2h avg per entry)
userSchema.virtual('totalWatchHours').get(function () {
  return this.watchHistory ? Math.round(this.watchHistory.length * 2) : 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);
