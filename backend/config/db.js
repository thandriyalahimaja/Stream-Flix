import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`📦 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
