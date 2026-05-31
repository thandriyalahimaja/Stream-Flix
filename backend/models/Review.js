import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  content: { type: String, maxlength: 1000 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
