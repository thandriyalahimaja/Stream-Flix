import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['watch', 'like', 'review', 'watchlist', 'search'], required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
