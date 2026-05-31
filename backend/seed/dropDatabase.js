import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function dropDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/StreamFlix';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  Database dropped successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    process.exit(1);
  }
}

dropDatabase();
