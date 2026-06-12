import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Movie from '../models/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads all movies from the database and updates backend/seed/seedMoviesProduction.js
 * to keep the seed data in sync with admin additions/updates/deletions.
 */
export async function syncDbToSeedFile() {
  try {
    const movies = await Movie.find().sort({ title: 1 }).lean();
    const cleanMovies = movies.map((movie) => ({
      title: movie.title,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration,
      genres: movie.genres,
      poster: {
        url: movie.poster?.url || null,
        publicId: movie.poster?.publicId || null,
      },
      backdrop: {
        url: movie.backdrop?.url || null,
        publicId: movie.backdrop?.publicId || null,
      },
      youtubeId: movie.youtubeId || null,
      synopsis: movie.synopsis,
      cast: movie.cast || [],
      director: movie.director,
      smartLabel: movie.smartLabel || '',
    }));

    const seedFilePath = path.join(__dirname, '../seed/seedMoviesProduction.js');

    const code = `/**
 * StreamFlix — Production Movie Seed Script
 *
 * Generated from cleaned seed export.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Movie from '../models/Movie.js';

export const CURRENT_SEED_VERSION = '2026-06-streamflix-v2';

export const movieCatalog = ${JSON.stringify(cleanMovies, null, 2)};

export async function seedMoviesProduction({ shouldConnect = true } = {}) {
  try {
    if (shouldConnect) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/StreamFlix';
      await mongoose.connect(mongoUri);
    }
    
    console.log('Seeding/updating movie database catalog...');
    
    let upsertCount = 0;
    for (const movie of movieCatalog) {
      await Movie.findOneAndUpdate(
        { title: movie.title, year: movie.year },
        { $set: movie },
        { upsert: true, new: true }
      );
      upsertCount++;
    }
    
    console.log(\`Successfully processed/upserted \${upsertCount} movies.\`);
    
    if (shouldConnect) {
      await mongoose.disconnect();
    }
    return { errorCount: 0 };
  } catch (err) {
    console.error('Seed error:', err);
    if (shouldConnect) {
      try { await mongoose.disconnect(); } catch (_) {}
    }
    throw err;
  }
}

import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('seedMoviesProduction.js')
);

if (isMain) {
  (async () => {
    try {
      await seedMoviesProduction({ shouldConnect: true });
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  })();
}
`;

    fs.writeFileSync(seedFilePath, code, 'utf-8');
    console.log('Successfully synchronized database changes to seedMoviesProduction.js');
  } catch (err) {
    console.error('Failed to sync DB changes to seed file:', err);
  }
}
