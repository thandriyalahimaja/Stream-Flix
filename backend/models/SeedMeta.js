import mongoose from 'mongoose';

const seedMetaSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('SeedMeta', seedMetaSchema);
