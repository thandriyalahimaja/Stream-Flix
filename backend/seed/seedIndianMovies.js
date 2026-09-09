import dns from 'node:dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Movie from '../models/Movie.js';
import SeedMeta from '../models/SeedMeta.js';

export const INDIAN_MOVIES_SEED_VERSION = '2026-09-streamflix-indian-770-v1';

export async function seedIndianMovies({ isDryRun = false, shouldConnect = true } = {}) {
  const rootDir = path.resolve(__dirname, '../../');
  const canonicalSeedFile = path.join(rootDir, 'data/production/streamflix_indian_seed.json');
  const embeddingsFile = path.join(rootDir, 'data/output/phase3/movies_with_embeddings.json');
  const semanticFile = path.join(rootDir, 'data/output/phase2_6/final_indian_movies_semantic.json');
  const reportDir = path.join(rootDir, 'data/output/phase4');

  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  console.log(`======================================================`);
  console.log(`STREAMFLIX INDIAN CATALOG SEED: ${isDryRun ? 'DRY RUN' : 'PRODUCTION IMPORT'}`);
  console.log(`======================================================`);

  let seedRecords = [];
  const embeddingMap = new Map();

  if (fs.existsSync(canonicalSeedFile)) {
    console.log(`Loading canonical production seed: ${canonicalSeedFile}`);
    seedRecords = JSON.parse(fs.readFileSync(canonicalSeedFile, 'utf8'));
    seedRecords.forEach(m => {
      if (m.imdbId && m.embedding) {
        embeddingMap.set(m.imdbId, {
          embedding: m.embedding,
          embeddingModel: m.embeddingModel || 'gemini-embedding-2-preview',
          embeddingDimensions: m.embeddingDimensions || 768,
          embeddingVersion: m.embeddingVersion || 'phase3-v1'
        });
      }
    });
  } else if (fs.existsSync(embeddingsFile) && fs.existsSync(semanticFile)) {
    console.log(`Canonical seed not found. Loading from phase output datasets...`);
    const embeddingsData = JSON.parse(fs.readFileSync(embeddingsFile, 'utf8'));
    seedRecords = JSON.parse(fs.readFileSync(semanticFile, 'utf8'));
    embeddingsData.forEach(e => {
      embeddingMap.set(e.imdbId, {
        embedding: e.embedding,
        embeddingModel: e.embeddingModel || 'gemini-embedding-2-preview',
        embeddingDimensions: e.embeddingDimensions || 768,
        embeddingVersion: e.embeddingVersion || 'phase3-v1'
      });
    });
  } else {
    throw new Error('Required authoritative datasets missing (data/production/streamflix_indian_seed.json or data/output/)');
  }

  console.log(`Authoritative records: ${seedRecords.length} movies, ${embeddingMap.size} embedding vectors.`);

  if (shouldConnect) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/StreamFlix';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully.');
  }

  const initialDbCount = await Movie.countDocuments();
  console.log(`Current movies in MongoDB before import: ${initialDbCount}`);

  // Fetch all existing movies in DB for identity matching
  const existingMovies = await Movie.find({}, '_id imdbId tmdbId title year views likes dislikes reviewCount avgUserRating').lean();
  console.log(`Indexed ${existingMovies.length} existing database records for collision detection.`);

  const existingByImdb = new Map();
  const existingByTmdb = new Map();
  const existingByTitleYear = new Map();

  existingMovies.forEach(m => {
    if (m.imdbId) existingByImdb.set(m.imdbId.trim().toLowerCase(), m);
    if (m.tmdbId) existingByTmdb.set(Number(m.tmdbId), m);
    if (m.title && m.year) {
      const key = `${m.title.trim().toLowerCase()}::${m.year}`;
      existingByTitleYear.set(key, m);
    }
  });

  const stats = {
    totalInputRecords: seedRecords.length,
    initialDbCount,
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    validEmbeddingCount: 0,
    missingEmbeddingCount: 0,
    isDryRun,
    matchedBy: {
      imdbId: 0,
      tmdbId: 0,
      titleYear: 0
    },
    sampleOperations: []
  };

  const processedIdentities = new Set();

  for (let i = 0; i < seedRecords.length; i++) {
    const m = seedRecords[i];
    const imdbIdKey = m.imdbId ? m.imdbId.trim().toLowerCase() : null;

    if (imdbIdKey && processedIdentities.has(imdbIdKey)) {
      stats.duplicateCount++;
      continue;
    }
    if (imdbIdKey) processedIdentities.add(imdbIdKey);

    // Embeddings validation
    const embData = embeddingMap.get(m.imdbId);
    let validEmbedding = null;
    if (embData && Array.isArray(embData.embedding) && embData.embedding.length === 768) {
      const allFinite = embData.embedding.every(n => typeof n === 'number' && Number.isFinite(n));
      if (allFinite) {
        validEmbedding = embData.embedding;
        stats.validEmbeddingCount++;
      } else {
        stats.invalidCount++;
      }
    } else {
      stats.missingEmbeddingCount++;
    }

    // Determine target document structure
    const docData = {
      title: m.title.trim(),
      year: Number(m.year),
      rating: Number(m.rating || 7.0),
      duration: m.duration || `${m.runtimeMinutes || 120}m`,
      genres: Array.isArray(m.genres) ? m.genres : ['Drama'],
      poster: {
        url: (typeof m.poster === 'object' && m.poster !== null ? m.poster.url : m.poster) || null,
        publicId: null
      },
      backdrop: {
        url: (typeof m.backdrop === 'object' && m.backdrop !== null ? m.backdrop.url : m.backdrop) || null,
        publicId: null
      },
      youtubeId: m.youtubeId || (m.trailer && m.trailer.youtubeId) || null,
      synopsis: m.synopsis || 'No synopsis available.',
      cast: Array.isArray(m.cast) ? m.cast : [],
      director: m.director || 'Unknown Director',
      smartLabel: m.qualityTier === 'Tier 1' ? 'Top Pick' : (m.qualityTier === 'Tier 2' ? 'Popular' : ''),
      imdbId: m.imdbId,
      tmdbId: m.tmdbId ? Number(m.tmdbId) : null,
      language: m.language,
      languageName: m.languageName,
      industry: m.industry,
      keywords: Array.isArray(m.keywords) ? m.keywords : [],
      themes: Array.isArray(m.themes) ? m.themes : [],
      moods: Array.isArray(m.moods) ? m.moods : [],
      embedding: validEmbedding || undefined,
      embeddingModel: embData?.embeddingModel || 'gemini-embedding-2-preview',
      embeddingDimensions: embData?.embeddingDimensions || 768,
      embeddingVersion: embData?.embeddingVersion || 'phase3-v1',
      embeddingText: m.embeddingText || null,
      qualityScore: m.qualityScore || null,
      weightedRating: m.weightedRating || null,
      qualityTier: m.qualityTier || null,
      voteCount: m.voteCount || null,
      popularity: m.popularity || null,
      trailer: m.trailer || null
    };

    // Identity matching priority:
    // 1. IMDb ID
    // 2. TMDB ID
    // 3. title + year
    let existingMatch = null;
    let matchReason = null;

    if (imdbIdKey && existingByImdb.has(imdbIdKey)) {
      existingMatch = existingByImdb.get(imdbIdKey);
      matchReason = 'imdbId';
    } else if (m.tmdbId && existingByTmdb.has(Number(m.tmdbId))) {
      existingMatch = existingByTmdb.get(Number(m.tmdbId));
      matchReason = 'tmdbId';
    } else {
      const titleYearKey = `${m.title.trim().toLowerCase()}::${m.year}`;
      if (existingByTitleYear.has(titleYearKey)) {
        existingMatch = existingByTitleYear.get(titleYearKey);
        matchReason = 'titleYear';
      }
    }

    if (existingMatch) {
      stats.updatedCount++;
      stats.matchedBy[matchReason]++;

      if (stats.sampleOperations.length < 5) {
        stats.sampleOperations.push({
          type: 'UPDATE',
          matchReason,
          existingId: existingMatch._id,
          title: m.title,
          year: m.year,
          imdbId: m.imdbId
        });
      }

      if (!isDryRun) {
        await Movie.findByIdAndUpdate(existingMatch._id, { $set: docData });
      }
    } else {
      stats.insertedCount++;

      if (stats.sampleOperations.length < 5) {
        stats.sampleOperations.push({
          type: 'INSERT',
          title: m.title,
          year: m.year,
          imdbId: m.imdbId
        });
      }

      if (!isDryRun) {
        await Movie.create({
          ...docData,
          views: 0,
          likes: 0,
          dislikes: 0,
          reviewCount: 0,
          avgUserRating: 0
        });
      }
    }
  }

  let finalDbCount = initialDbCount;
  if (!isDryRun) {
    finalDbCount = await Movie.countDocuments();
  }
  stats.finalDbCount = finalDbCount;

  console.log(`\nImport Summary (${isDryRun ? 'DRY RUN' : 'EXECUTED'}):`);
  console.log(`- Inserted: ${stats.insertedCount}`);
  console.log(`- Updated:  ${stats.updatedCount}`);
  console.log(`- Duplicates skipped: ${stats.duplicateCount}`);
  console.log(`- Valid 768-dim embeddings: ${stats.validEmbeddingCount}`);
  console.log(`- Expected final DB count: ${initialDbCount + (isDryRun ? stats.insertedCount : 0)} (Actual: ${finalDbCount})`);

  fs.writeFileSync(path.join(reportDir, 'seed_import_report.json'), JSON.stringify(stats, null, 2));
  console.log(`Report written to data/output/phase4/seed_import_report.json`);

  if (shouldConnect) {
    await mongoose.disconnect();
    console.log('MongoDB connection closed cleanly.');
  }

  return stats;
}

/**
 * Startup hook executed after MongoDB connects.
 * Uses SeedMeta to check if the Indian catalog seed version is already executed.
 * Runs seed and updates the version only if needed.
 */
export async function maybeRunIndianMovieSeed() {
  if (process.env.AUTO_SYNC_INDIAN_MOVIES === 'false') {
    console.log('ℹ️  AUTO_SYNC_INDIAN_MOVIES is explicitly disabled. Skipping Indian catalog seed.');
    return;
  }

  const forceSync = process.env.SEED_FORCE_SYNC === 'true';
  console.log(`🔍 Indian movie catalog check active. Target seed version: ${INDIAN_MOVIES_SEED_VERSION}`);

  try {
    if (!forceSync) {
      const record = await SeedMeta.findOne({ version: INDIAN_MOVIES_SEED_VERSION });
      if (record) {
        console.log(`✅ Indian movie catalog is up-to-date with version: "${INDIAN_MOVIES_SEED_VERSION}". Skipping.`);
        return;
      }
      console.log(`⚠️  Seed version "${INDIAN_MOVIES_SEED_VERSION}" not found in database. Running Indian catalog seed...`);
    }

    const stats = await seedIndianMovies({ isDryRun: false, shouldConnect: false });

    if (stats.invalidCount > 0 || stats.validEmbeddingCount !== 770) {
      throw new Error(`Indian seed verification failed: ${stats.invalidCount} invalid, ${stats.validEmbeddingCount}/770 valid embeddings`);
    }

    await SeedMeta.findOneAndUpdate(
      { version: INDIAN_MOVIES_SEED_VERSION },
      { executedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`🎉 Indian movie catalog successfully seeded and registered with version: "${INDIAN_MOVIES_SEED_VERSION}".`);
  } catch (error) {
    console.error('❌ Failed to run automatic Indian movie catalog seed:', error);
    throw error;
  }
}

import { fileURLToPath as fURL } from 'node:url';
const isMain = process.argv[1] && (
  process.argv[1] === fURL(import.meta.url) ||
  process.argv[1].endsWith('seedIndianMovies.js')
);

if (isMain) {
  const isDryRun = process.argv.includes('--dry-run');
  seedIndianMovies({ isDryRun, shouldConnect: true })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}
