/**
 * StreamFlix — Movie Catalog Health Check
 *
 * Purpose: non-destructive read-only audit of the Movie collection.
 *
 * Checks:
 *   1. Total movie count
 *   2. Movies missing required fields (title, year, poster.url, backdrop.url, youtubeId)
 *   3. Movies with null/empty poster or backdrop URLs
 *   4. Duplicate (title + year) combinations
 *   5. Movies with identical youtubeIds (copy-paste errors)
 *   6. Genre distribution
 *   7. Indian cinema coverage
 *
 * Usage:
 *   node seed/verifyMovies.js
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more issues found (details printed to console)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Movie from '../models/Movie.js';

// ─── ANSI colours ─────────────────────────────────────────────────────────────
const G = (s) => `\x1b[32m${s}\x1b[0m`;   // green
const R = (s) => `\x1b[31m${s}\x1b[0m`;   // red
const Y = (s) => `\x1b[33m${s}\x1b[0m`;   // yellow
const B = (s) => `\x1b[1m${s}\x1b[0m`;    // bold

async function verifyMovies() {
  let issueCount = 0;

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/StreamFlix';
    await mongoose.connect(mongoUri);
    console.log(B('\n🔍 StreamFlix — Movie Catalog Health Check\n') + '═'.repeat(55));

    const movies = await Movie.find().lean();
    console.log(`\n📦 Total movies in database: ${B(movies.length)}\n`);

    // ── 1. Missing required fields ─────────────────────────────────────────────
    const requiredFields = ['title', 'year', 'rating', 'duration', 'genres', 'synopsis', 'director'];
    const missingRequired = [];
    for (const m of movies) {
      const missing = requiredFields.filter((f) => !m[f]);
      if (missing.length > 0) {
        missingRequired.push({ title: m.title || 'UNKNOWN', year: m.year, missing });
      }
    }
    if (missingRequired.length === 0) {
      console.log(G('  ✅ Required fields: all OK'));
    } else {
      console.log(R(`  ❌ Missing required fields in ${missingRequired.length} movies:`));
      missingRequired.forEach((m) => console.log(`     - "${m.title}" (${m.year}): missing [${m.missing.join(', ')}]`));
      issueCount += missingRequired.length;
    }

    // ── 2. Missing / null poster URLs ──────────────────────────────────────────
    const noPoster = movies.filter((m) => !m.poster?.url);
    if (noPoster.length === 0) {
      console.log(G('  ✅ Poster URLs: all present'));
    } else {
      console.log(Y(`  ⚠️  ${noPoster.length} movies have no poster.url:`));
      noPoster.forEach((m) => console.log(`     - "${m.title}" (${m.year})`));
      issueCount += noPoster.length;
    }

    // ── 3. Missing / null backdrop URLs ───────────────────────────────────────
    const noBackdrop = movies.filter((m) => !m.backdrop?.url);
    if (noBackdrop.length === 0) {
      console.log(G('  ✅ Backdrop URLs: all present'));
    } else {
      console.log(Y(`  ⚠️  ${noBackdrop.length} movies have no backdrop.url:`));
      noBackdrop.forEach((m) => console.log(`     - "${m.title}" (${m.year})`));
      issueCount += noBackdrop.length;
    }

    // ── 4. Missing YouTube IDs ─────────────────────────────────────────────────
    const noTrailer = movies.filter((m) => !m.youtubeId);
    if (noTrailer.length === 0) {
      console.log(G('  ✅ YouTube IDs: all present'));
    } else {
      console.log(Y(`  ⚠️  ${noTrailer.length} movies have no youtubeId:`));
      noTrailer.forEach((m) => console.log(`     - "${m.title}" (${m.year})`));
      issueCount += noTrailer.length;
    }

    // ── 5. Duplicate (title + year) ────────────────────────────────────────────
    const seen = new Map();
    const duplicates = [];
    for (const m of movies) {
      const key = `${m.title?.toLowerCase()}|${m.year}`;
      if (seen.has(key)) {
        duplicates.push(m.title);
      } else {
        seen.set(key, true);
      }
    }
    if (duplicates.length === 0) {
      console.log(G('  ✅ Duplicates: none found'));
    } else {
      console.log(R(`  ❌ Duplicate (title+year) found: ${duplicates.join(', ')}`));
      issueCount += duplicates.length;
    }

    // ── 6. Duplicate YouTube IDs ───────────────────────────────────────────────
    const ytSeen = new Map();
    const dupYt = [];
    for (const m of movies) {
      if (!m.youtubeId) continue;
      if (ytSeen.has(m.youtubeId)) {
        dupYt.push(`"${m.title}" shares youtubeId "${m.youtubeId}" with "${ytSeen.get(m.youtubeId)}"`);
      } else {
        ytSeen.set(m.youtubeId, m.title);
      }
    }
    if (dupYt.length === 0) {
      console.log(G('  ✅ YouTube IDs: no duplicates'));
    } else {
      console.log(R(`  ❌ Duplicate YouTube IDs found:`));
      dupYt.forEach((d) => console.log(`     - ${d}`));
      issueCount += dupYt.length;
    }

    // ── 7. Genre distribution ─────────────────────────────────────────────────
    const genreCount = {};
    for (const m of movies) {
      (m.genres || []).forEach((g) => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    }
    console.log('\n' + B('  📊 Genre Distribution:'));
    Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([g, c]) => console.log(`     ${g.padEnd(20)} ${c} movies`));

    // ── 8. Indian cinema coverage ─────────────────────────────────────────────
    const indianMovies = movies.filter((m) => m.smartLabel?.includes('🇮🇳'));
    console.log(`\n  ${B('🇮🇳 Indian cinema:')} ${indianMovies.length} movies`);
    indianMovies.forEach((m) => console.log(`     - "${m.title}" (${m.year})`));
    if (indianMovies.length < 8) {
      console.log(Y(`  ⚠️  Fewer than 8 Indian movies — consider adding more for demo appeal.`));
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    if (issueCount === 0) {
      console.log(G(`✅ All checks passed — catalog looks healthy (${movies.length} movies)\n`));
    } else {
      console.log(R(`❌ Found ${issueCount} issue(s) — fix them before demo\n`));
    }

    await mongoose.disconnect();
    process.exit(issueCount > 0 ? 1 : 0);
  } catch (err) {
    console.error(R('❌ Fatal error:'), err);
    process.exit(1);
  }
}

verifyMovies();
