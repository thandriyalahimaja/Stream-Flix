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
  trailerHistory: [{
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    watchedAt: { type: Date, default: Date.now },
  }],
  likedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  dislikedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  refreshToken: { type: String, select: false },
}, { timestamps: true });

// Virtual: total watch time (now representing trailer starts count for capstone compliance)
userSchema.virtual('totalWatchHours').get(function () {
  return this.trailerHistory ? this.trailerHistory.length : 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);
