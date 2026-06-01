/**
 * StreamFlix — Movie Sync and Auto-Sync Controller
 *
 * Provides functions to synchronize the movie catalog idempotently and
 * check/run sync on startup using MongoDB SeedMeta versioning.
 */

import mongoose from 'mongoose';
import { seedMoviesProduction, CURRENT_SEED_VERSION } from './seedMoviesProduction.js';
import SeedMeta from '../models/SeedMeta.js';

/**
 * Reusable function to synchronize movies.
 * @param {Object} options - Sync options
 * @param {boolean} options.isDryRun - Perform a dry run check
 * @param {boolean} options.shouldConnect - Connect to and disconnect from MongoDB
 */
export async function syncMovies(options = {}) {
  console.log('🔄 Starting movie catalog sync...');
  return await seedMoviesProduction(options);
}

/**
 * Startup hook executed after MongoDB connects.
 * Uses SeedMeta to check if the current seed version is already executed.
 * Runs sync and updates the version only if needed.
 */
export async function maybeRunMovieSync() {
  if (process.env.AUTO_SYNC_MOVIES !== 'true') {
    console.log('ℹ️  AUTO_SYNC_MOVIES is not enabled. Skipping startup auto-sync.');
    return;
  }

  const forceSync = process.env.SEED_FORCE_SYNC === 'true';
  if (forceSync) {
    console.log('⚡ SEED_FORCE_SYNC=true detected. Forcing movie catalog synchronization...');
  }

  console.log(`🔍 Auto-sync check active. Target seed version: ${CURRENT_SEED_VERSION}`);

  try {
    if (!forceSync) {
      // Check if the current version has already been successfully seeded
      const record = await SeedMeta.findOne({ version: CURRENT_SEED_VERSION });

      if (record) {
        console.log(`✅ Database movie catalog is up-to-date with version: "${CURRENT_SEED_VERSION}". Skipping synchronization.`);
        return;
      }

      console.log(`⚠️  Seed version "${CURRENT_SEED_VERSION}" not found in database. Running synchronization...`);
    }

    // Run the sync movies (connected is true in startup server context, so shouldConnect is false)
    const stats = await syncMovies({ isDryRun: false, shouldConnect: false });

    if (stats.errorCount > 0) {
      console.error(`❌ Sync completed with ${stats.errorCount} error(s). Version update aborted.`);
      return;
    }

    // Upsert version to mark it as successfully executed
    await SeedMeta.findOneAndUpdate(
      { version: CURRENT_SEED_VERSION },
      { executedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`🎉 Database movie catalog successfully synchronized and updated to version: "${CURRENT_SEED_VERSION}".`);
  } catch (error) {
    console.error('❌ Failed to run automatic movie catalog sync:', error);
  }
}

// ─── Direct CLI Execution Support ──────────────────────────────────────────────
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('syncMovies.js')
);

if (isMain) {
  (async () => {
    try {
      const isDryRun = process.argv.includes('--dry-run');
      const stats = await syncMovies({ isDryRun, shouldConnect: true });
      process.exit(stats.errorCount > 0 ? 1 : 0);
    } catch (err) {
      console.error('Fatal CLI sync error:', err);
      process.exit(1);
    }
  })();
}
