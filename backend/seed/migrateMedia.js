/**
 * StreamFlix — One-Time Cloudinary Media Migration Script
 *
 * Migrates movie poster and backdrop images from TMDB CDN URLs to Cloudinary.
 *
 * Strategy:
 *   For each movie with poster.publicId === null:
 *     1. Fetch the TMDB image buffer via HTTP
 *     2. Upload to Cloudinary (folder: streamflix/posters or streamflix/backdrops)
 *     3. Update Movie document:
 *        poster: { url: cloudinary_secure_url, publicId: cloudinary_public_id }
 *
 *   - NEVER deletes movies, users, reviews, or any other collection
 *   - NEVER calls dropDatabase / deleteMany
 *   - Safe to re-run: skips movies that already have publicId set
 *
 * Pre-requisites:
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 *   - MONGO_URI in .env
 *
 * Usage:
 *   node seed/migrateMedia.js              ← migrate all unmigrated movies
 *   node seed/migrateMedia.js --dry-run    ← show what would be uploaded
 *
 * Cloudinary quota note:
 *   Free plan: 25 credits/month (~25 GB transforms or ~3000 uploads)
 *   98 posters + 98 backdrops = 196 uploads — well within free tier.
 *
 * Exit codes:
 *   0 — all migrations succeeded
 *   1 — one or more errors occurred (partial migration is still safe to re-run)
 */

import https from 'https';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import cloudinary from '../config/cloudinary.js';
import Movie from '../models/Movie.js';

// ─── ANSI colours ─────────────────────────────────────────────────────────────
const G = (s) => `\x1b[32m${s}\x1b[0m`;
const R = (s) => `\x1b[31m${s}\x1b[0m`;
const Y = (s) => `\x1b[33m${s}\x1b[0m`;
const B = (s) => `\x1b[1m${s}\x1b[0m`;

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'streamflix';
const CONCURRENCY = 3; // upload N images in parallel to avoid rate limits

/**
 * Fetch a URL and return the raw buffer.
 */
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Upload a buffer to Cloudinary and return { url, publicId }.
 */
async function uploadToCloudinary(buffer, publicIdBase, subfolder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUDINARY_FOLDER}/${subfolder}`,
        public_id: publicIdBase,
        resource_type: 'image',
        overwrite: false, // do not overwrite if already exists
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    ).end(buffer);
  });
}

/**
 * Process a chunk of movies in parallel (up to CONCURRENCY at once).
 */
async function processBatch(movies, isDryRun, stats) {
  await Promise.allSettled(
    movies.map(async (movie) => {
      const slug = `${movie.title.replace(/[^a-zA-Z0-9]/g, '_')}_${movie.year}`;

      // ── POSTER ───────────────────────────────────────────────────────────────
      if (movie.poster?.url && !movie.poster?.publicId) {
        if (isDryRun) {
          console.log(Y(`  [DRY-RUN] Would upload poster: "${movie.title}" (${movie.year})`));
          stats.dryRun++;
        } else {
          try {
            const buffer = await fetchBuffer(movie.poster.url);
            const result = await uploadToCloudinary(buffer, `poster_${slug}`, 'posters');
            await Movie.findByIdAndUpdate(movie._id, { 'poster.url': result.url, 'poster.publicId': result.publicId });
            console.log(G(`  ✅ Poster migrated: "${movie.title}" (${movie.year})`));
            stats.posters++;
          } catch (err) {
            console.error(R(`  ❌ Poster FAILED: "${movie.title}" — ${err.message}`));
            stats.errors.push({ title: movie.title, field: 'poster', error: err.message });
          }
        }
      }

      // ── BACKDROP ─────────────────────────────────────────────────────────────
      if (movie.backdrop?.url && !movie.backdrop?.publicId) {
        if (isDryRun) {
          console.log(Y(`  [DRY-RUN] Would upload backdrop: "${movie.title}" (${movie.year})`));
          stats.dryRun++;
        } else {
          try {
            const buffer = await fetchBuffer(movie.backdrop.url);
            const result = await uploadToCloudinary(buffer, `backdrop_${slug}`, 'backdrops');
            await Movie.findByIdAndUpdate(movie._id, { 'backdrop.url': result.url, 'backdrop.publicId': result.publicId });
            console.log(G(`  ✅ Backdrop migrated: "${movie.title}" (${movie.year})`));
            stats.backdrops++;
          } catch (err) {
            console.error(R(`  ❌ Backdrop FAILED: "${movie.title}" — ${err.message}`));
            stats.errors.push({ title: movie.title, field: 'backdrop', error: err.message });
          }
        }
      }

      // Already migrated
      if (movie.poster?.publicId && movie.backdrop?.publicId) {
        console.log(`  ⏭  SKIP (already on Cloudinary): "${movie.title}" (${movie.year})`);
        stats.skipped++;
      }
    })
  );
}

async function migrateMedia() {
  const isDryRun = process.argv.includes('--dry-run');

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/StreamFlix';
    await mongoose.connect(mongoUri);
    console.log(B('\n☁️  StreamFlix — Cloudinary Media Migration\n') + '═'.repeat(55));
    console.log(`🔧 Mode: ${isDryRun ? Y('DRY RUN (no uploads)') : G('LIVE MIGRATION')}\n`);

    // Only fetch movies that still have TMDB URLs (publicId is null)
    const unmigrated = await Movie.find({
      $or: [
        { 'poster.publicId': null },
        { 'backdrop.publicId': null },
      ],
    }).lean();

    const alreadyDone = await Movie.countDocuments({
      'poster.publicId': { $ne: null },
      'backdrop.publicId': { $ne: null },
    });

    console.log(`📦 Total movies: ${unmigrated.length + alreadyDone}`);
    console.log(`✅ Already on Cloudinary: ${alreadyDone}`);
    console.log(`⬆️  To migrate: ${unmigrated.length}\n`);

    if (unmigrated.length === 0) {
      console.log(G('All movies are already on Cloudinary. Nothing to do.\n'));
      await mongoose.disconnect();
      process.exit(0);
    }

    const stats = { posters: 0, backdrops: 0, skipped: alreadyDone, dryRun: 0, errors: [] };

    // Process in batches of CONCURRENCY
    for (let i = 0; i < unmigrated.length; i += CONCURRENCY) {
      const batch = unmigrated.slice(i, i + CONCURRENCY);
      await processBatch(batch, isDryRun, stats);
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log(B('📊 MIGRATION SUMMARY'));
    console.log('═'.repeat(55));
    if (isDryRun) {
      console.log(Y(`  [DRY-RUN] Would upload: ${stats.dryRun} assets`));
    } else {
      console.log(G(`  ✅ Posters migrated  : ${stats.posters}`));
      console.log(G(`  ✅ Backdrops migrated: ${stats.backdrops}`));
      console.log(`  ⏭  Already skipped  : ${stats.skipped}`);
      console.log(R(`  ❌ Errors           : ${stats.errors.length}`));
      if (stats.errors.length > 0) {
        console.log('\n  Error details:');
        stats.errors.forEach((e) =>
          console.log(`    - "${e.title}" [${e.field}]: ${e.error}`)
        );
        console.log('\n  Re-run this script to retry failed uploads.\n');
      }
    }
    console.log('═'.repeat(55));
    console.log('✅ Users, reviews, watchlists, admins were NOT touched.\n');

    await mongoose.disconnect();
    process.exit(stats.errors.length > 0 ? 1 : 0);
  } catch (err) {
    console.error(R('❌ Fatal error:'), err);
    process.exit(1);
  }
}

migrateMedia();
