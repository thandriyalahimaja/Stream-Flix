/**
 * Empirical Adversarial Stress Test Suite for Taste Profile Service
 * (backend/services/tasteProfileService.js)
 *
 * Tests:
 * 1. Accidental single trailer view noise elimination
 * 2. Extreme rating combinations (e.g. 5x 1-star vs 1x 10-star)
 * 3. Cold start boundaries (0, 1 trailer, 1 like, 2 likes, etc.)
 * 4. Time decay edge cases (future dates, past dates, invalid dates, undefined)
 * 5. Sparse movie metadata (empty genres, missing directors, null themes/moods)
 * 6. Avoided genres neutral separation and leak prevention
 * 7. Zero score leakage & schema compliance
 */

import {
  buildDeterministicTasteProfile,
  getTasteProfileForUser,
  getFallbackTasteSummary,
  validateTasteProfileSummary,
  computeProfileVersion,
  buildCompoundCacheKey,
  tasteProfileCache,
  formatLanguage,
  formatIndustry,
} from '../services/tasteProfileService.js';
import { computeTimeDecay } from '../services/semanticRecommendationService.js';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    results.push({ testName, status: 'PASS', details });
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    results.push({ testName, status: 'FAIL', details });
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

console.log('================================================================');
console.log(' EMPIRICAL ADVERSARIAL STRESS TESTING: TasteProfileService');
console.log('================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. ACCIDENTAL SINGLE TRAILER VIEW
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- Suite 1: Accidental Single Trailer View ---');

const singleTrailerMovie = {
  _id: 'movie_horror_1',
  title: 'Scary House',
  genres: ['Horror'],
  language: 'te',
  languageName: 'Telugu',
  industry: 'Tollywood',
  themes: ['Supernatural'],
  moods: ['Dark'],
  director: 'Ram Gopal Varma',
};

const userSingleTrailer = {
  _id: 'user_single_trailer',
  preferences: { genres: [], subtitleLang: '' },
  likedMovies: [],
  dislikedMovies: [],
  trailerHistory: [
    { movie: singleTrailerMovie, watchedAt: new Date() },
  ],
};

const profileTrailer1 = buildDeterministicTasteProfile({
  userDoc: userSingleTrailer,
  reviews: [],
  watchlist: [],
});

assert(
  profileTrailer1.topGenres.length === 0,
  'Single trailer NEVER produces topGenres preference',
  `Expected 0 genres, got: ${JSON.stringify(profileTrailer1.topGenres)}`
);

assert(
  profileTrailer1.topLanguages.length === 0,
  'Single trailer NEVER produces topLanguages preference',
  `Expected 0 languages, got: ${JSON.stringify(profileTrailer1.topLanguages)}`
);

assert(
  profileTrailer1.topIndustries.length === 0,
  'Single trailer NEVER produces topIndustries preference',
  `Expected 0 industries, got: ${JSON.stringify(profileTrailer1.topIndustries)}`
);

assert(
  profileTrailer1.topDirectors.length === 0,
  'Single trailer NEVER produces topDirectors preference',
  `Expected 0 directors, got: ${JSON.stringify(profileTrailer1.topDirectors)}`
);

assert(
  profileTrailer1.profileStrength === 'low',
  'Single trailer produces profileStrength: "low"',
  `Got: ${profileTrailer1.profileStrength}`
);

// Verify async entrypoint returns cold-start summary without Gemini calls
const fullProfileTrailer1 = await getTasteProfileForUser('user_single_trailer', {
  userDoc: userSingleTrailer,
  reviews: [],
  watchlist: [],
  skipCache: true,
});

assert(
  fullProfileTrailer1.summary.source === 'cold-start',
  'Single trailer full profile returns source: "cold-start"',
  `Got source: ${fullProfileTrailer1.summary.source}`
);
assert(
  fullProfileTrailer1.summary.confidence === 'low',
  'Single trailer summary confidence is "low"',
  `Got: ${fullProfileTrailer1.summary.confidence}`
);

// Stress test: 2 trailer views of the SAME movie
const userTwoTrailersSameMovie = {
  _id: 'user_trailer_twice',
  preferences: { genres: [], subtitleLang: '' },
  likedMovies: [],
  dislikedMovies: [],
  trailerHistory: [
    { movie: singleTrailerMovie, watchedAt: new Date(Date.now() - 3600000) },
    { movie: singleTrailerMovie, watchedAt: new Date() },
  ],
};

const profileTrailer2 = buildDeterministicTasteProfile({
  userDoc: userTwoTrailersSameMovie,
  reviews: [],
  watchlist: [],
});

console.log('  [OBSERVATION] 2 views of same trailer -> topGenres:', profileTrailer2.topGenres, 'profileStrength:', profileTrailer2.profileStrength);

assert(
  profileTrailer2.topGenres.length === 0,
  'Replaying a single trailer twice MUST NOT produce a top genre preference',
  `Single trailer replayed twice produced topGenres: ${JSON.stringify(profileTrailer2.topGenres)}`
);


// ─────────────────────────────────────────────────────────────────────────────
// 2. EXTREME RATING COMBINATIONS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 2: Extreme Rating Combinations ---');

// Scenario A: 5x 1-star ratings in Horror vs 1x 10-star rating in Sci-Fi
const horrorMovie = (id) => ({
  _id: `horror_${id}`,
  title: `Horror ${id}`,
  genres: ['Horror'],
  language: 'en',
  themes: ['Spooky'],
  moods: ['Dark'],
  director: 'Director H',
});

const sciFiMovie = {
  _id: 'scifi_1',
  title: 'SciFi Masterpiece',
  genres: ['Sci-Fi'],
  language: 'en',
  themes: ['Time Travel'],
  moods: ['Mind-Bending'],
  director: 'Director S',
};

const reviewsA = [
  { movie: horrorMovie(1), rating: 1, createdAt: new Date() },
  { movie: horrorMovie(2), rating: 1, createdAt: new Date() },
  { movie: horrorMovie(3), rating: 1, createdAt: new Date() },
  { movie: horrorMovie(4), rating: 1, createdAt: new Date() },
  { movie: horrorMovie(5), rating: 1, createdAt: new Date() },
  { movie: sciFiMovie, rating: 10, createdAt: new Date() },
];

const profile2A = buildDeterministicTasteProfile({
  userDoc: { _id: 'user_extreme_A', preferences: {} },
  reviews: reviewsA,
  watchlist: [],
});

assert(
  profile2A.topGenres.includes('Sci-Fi'),
  '10-star movie genre ("Sci-Fi") appears in topGenres',
  `Got: ${JSON.stringify(profile2A.topGenres)}`
);

assert(
  profile2A.avoidedGenres.includes('Horror'),
  '5x 1-star genre ("Horror") appears in avoidedGenres',
  `Got: ${JSON.stringify(profile2A.avoidedGenres)}`
);

assert(
  !profile2A.topGenres.includes('Horror'),
  '5x 1-star genre ("Horror") does NOT appear in topGenres',
  `Got: ${JSON.stringify(profile2A.topGenres)}`
);

// Scenario B: CONFLICTING RATINGS IN THE SAME GENRE:
// 5x 1-star ratings in 'Action' (negative score = 5 * 0.6 = 3.0)
// VS 1x 10-star rating in 'Action' (positive score = 1.0)
// Net preference: user clearly dislikes this genre 5 to 1!
const actionMovie = (id) => ({
  _id: `action_${id}`,
  title: `Action Film ${id}`,
  genres: ['Action'],
  language: 'hi',
});

const conflictingReviews = [
  { movie: actionMovie(1), rating: 1, createdAt: new Date() },
  { movie: actionMovie(2), rating: 1, createdAt: new Date() },
  { movie: actionMovie(3), rating: 1, createdAt: new Date() },
  { movie: actionMovie(4), rating: 1, createdAt: new Date() },
  { movie: actionMovie(5), rating: 1, createdAt: new Date() },
  { movie: actionMovie(6), rating: 10, createdAt: new Date() },
];

const profileConflict = buildDeterministicTasteProfile({
  userDoc: { _id: 'user_conflict', preferences: {} },
  reviews: conflictingReviews,
  watchlist: [],
});

console.log('  [OBSERVATION] Conflicting ratings (5x 1-star vs 1x 10-star Action):');
console.log('    topGenres:', profileConflict.topGenres);
console.log('    avoidedGenres:', profileConflict.avoidedGenres);
console.log('    profileStrength:', profileConflict.profileStrength);

assert(
  !profileConflict.topGenres.includes('Action'),
  'Genre with S_neg (3.0) >> S_pos (1.0) MUST NOT be in topGenres',
  `Action appeared in topGenres despite overwhelming negative rating!`
);

assert(
  profileConflict.avoidedGenres.includes('Action'),
  'Genre with S_neg (3.0) > S_pos (1.0) MUST be in avoidedGenres',
  `Action missing from avoidedGenres!`
);

// Scenario C: Unrated or missing rating review
const unratedReview = [
  { movie: horrorMovie(1), rating: null, createdAt: new Date() },
];
const profileUnrated = buildDeterministicTasteProfile({
  userDoc: { _id: 'u_unrated', preferences: {} },
  reviews: unratedReview,
  watchlist: [],
});
console.log('  [OBSERVATION] Review with null rating avoidedGenres:', profileUnrated.avoidedGenres);
assert(
  profileUnrated.avoidedGenres.length === 0,
  'Unrated review (rating: null) MUST NOT be classified as a negative 1-star review',
  `Null rating was penalized into avoidedGenres: ${JSON.stringify(profileUnrated.avoidedGenres)}`
);


// ─────────────────────────────────────────────────────────────────────────────
// 3. BOUNDARY CONDITIONS AROUND COLD START
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 3: Cold Start Boundary Conditions ---');

// 3.0: null userDoc / empty object
const profileNullDoc = buildDeterministicTasteProfile({ userDoc: null });
assert(profileNullDoc.profileStrength === 'low', 'null userDoc returns profileStrength: "low"', `Got: ${profileNullDoc.profileStrength}`);
assert(profileNullDoc.topGenres.length === 0, 'null userDoc returns empty topGenres', `Got: ${profileNullDoc.topGenres.length}`);

// 3.1: 0 interactions
const profileCold0 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u0', preferences: {} },
  reviews: [],
  watchlist: [],
});

assert(profileCold0.profileStrength === 'low', '0 interactions -> strength "low"', `Got: ${profileCold0.profileStrength}`);
assert(profileCold0.topGenres.length === 0, '0 interactions -> empty topGenres', `Got: ${profileCold0.topGenres.length}`);

// 3.2: Exactly 1 like
const profileLike1 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u1', preferences: {}, likedMovies: [sciFiMovie] },
  reviews: [],
  watchlist: [],
});
assert(profileLike1.profileStrength === 'low', '1 like -> strength "low" (insufficient evidence)', `Got: ${profileLike1.profileStrength}`);

// 3.3: Exactly 2 likes
const profileLike2 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u2', preferences: {}, likedMovies: [sciFiMovie, actionMovie(1)] },
  reviews: [],
  watchlist: [],
});
assert(profileLike2.profileStrength === 'medium', '2 likes -> strength "medium"', `Got: ${profileLike2.profileStrength}`);

// 3.4: 1 review rating 10
const profileRev10 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u_rev10', preferences: {} },
  reviews: [{ movie: sciFiMovie, rating: 10, createdAt: new Date() }],
  watchlist: [],
});
// rating 10 gives w = 1.0 >= 1.0, but totalEvidence = 1
assert(
  profileRev10.profileStrength === 'medium',
  '1 review with rating 10 (weight 1.0) achieves medium profile strength',
  `Got: ${profileRev10.profileStrength}`
);

// 3.5: 1 review rating 7
const profileRev7 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u_rev7', preferences: {} },
  reviews: [{ movie: sciFiMovie, rating: 7, createdAt: new Date() }],
  watchlist: [],
});
assert(
  profileRev7.profileStrength === 'low',
  '1 review with rating 7 (weight 0.7) remains profileStrength: "low"',
  `Got: ${profileRev7.profileStrength}`
);

// 3.6: 1 review rating 1 (dislike)
const profileRev1 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u_rev1', preferences: {} },
  reviews: [{ movie: horrorMovie(1), rating: 1, createdAt: new Date() }],
  watchlist: [],
});
assert(
  profileRev1.profileStrength === 'low',
  '1 review with rating 1 (negative) remains profileStrength: "low"',
  `Got: ${profileRev1.profileStrength}`
);

// 3.7: 2 reviews rating 1 (only negative interactions)
const profileRevNeg2 = buildDeterministicTasteProfile({
  userDoc: { _id: 'u_rev_neg2', preferences: {} },
  reviews: [
    { movie: horrorMovie(1), rating: 1, createdAt: new Date() },
    { movie: horrorMovie(2), rating: 1, createdAt: new Date() },
  ],
  watchlist: [],
});
console.log('  [OBSERVATION] 2x 1-star reviews (0 positive):');
console.log('    profileStrength:', profileRevNeg2.profileStrength);
console.log('    topGenres:', profileRevNeg2.topGenres);
console.log('    avoidedGenres:', profileRevNeg2.avoidedGenres);

// Does 2 dislikes alone trigger medium profile strength?
// If profileStrength is 'medium', getTasteProfileForUser would attempt verbalization!
const fullRevNeg2 = await getTasteProfileForUser('u_rev_neg2', {
  userDoc: { _id: 'u_rev_neg2', preferences: {} },
  reviews: [
    { movie: horrorMovie(1), rating: 1, createdAt: new Date() },
    { movie: horrorMovie(2), rating: 1, createdAt: new Date() },
  ],
  watchlist: [],
  skipCache: true,
  forceFallback: true,
});
console.log('    fullProfile fallback headline:', fullRevNeg2.summary.headline);
console.log('    fullProfile fallback summary:', fullRevNeg2.summary.summary);
console.log('    fullProfile fallback highlights:', fullRevNeg2.summary.highlights);

assert(
  Array.isArray(fullRevNeg2.summary.highlights),
  'Fallback highlights is an array even with 0 positive genres',
  `Got: ${JSON.stringify(fullRevNeg2.summary.highlights)}`
);


// ─────────────────────────────────────────────────────────────────────────────
// 4. TIME DECAY EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 4: Time Decay Edge Cases ---');

// 4.1: Future date (clock skew)
const futureDecay = computeTimeDecay(new Date(Date.now() + 86400000 * 30));
assert(
  futureDecay === 1.0,
  'Future date clamped to decay 1.0 (no negative or super-inflated decay)',
  `Got: ${futureDecay}`
);

// 4.2: Null / undefined eventDate
const nullDecay = computeTimeDecay(null);
const undefDecay = computeTimeDecay(undefined);
assert(nullDecay === 1.0, 'null eventDate returns 1.0 decay safely', `Got: ${nullDecay}`);
assert(undefDecay === 1.0, 'undefined eventDate returns 1.0 decay safely', `Got: ${undefDecay}`);

// 4.3: Invalid date string
const invalidDecay = computeTimeDecay('not-a-valid-date-string');
assert(invalidDecay === 1.0, 'Invalid date string returns 1.0 decay safely without NaN', `Got: ${invalidDecay}`);

// 4.4: Very old date (10 years ago)
const tenYearsAgo = new Date(Date.now() - 3650 * 86400000);
const oldDecay = computeTimeDecay(tenYearsAgo);
assert(
  oldDecay < 1e-10 && oldDecay >= 0,
  '10-year-old interaction decay factor is close to 0 and non-negative',
  `Got: ${oldDecay}`
);

// 4.5: Profile calculation with 10-year-old reviews
const oldReviewUser = {
  _id: 'u_old_reviews',
  preferences: {},
};
const oldReviews = [
  { movie: horrorMovie(1), rating: 10, createdAt: tenYearsAgo },
  { movie: horrorMovie(2), rating: 10, createdAt: tenYearsAgo },
];
const profileOld = buildDeterministicTasteProfile({
  userDoc: oldReviewUser,
  reviews: oldReviews,
  watchlist: [],
});

console.log('  [OBSERVATION] 10-year-old reviews:');
console.log('    topGenres:', profileOld.topGenres);
console.log('    recentInterests:', profileOld.recentInterests);
console.log('    profileStrength:', profileOld.profileStrength);

assert(
  profileOld.recentInterests.length === 0,
  '10-year-old reviews NEVER qualify as recentInterests',
  `Got recentInterests: ${JSON.stringify(profileOld.recentInterests)}`
);

// 4.6: Profile version hashing with invalid / weird dates
const weirdDateReviews = [
  { movie: { _id: 'm1' }, rating: 8, createdAt: 'INVALID_DATE' },
  { movie: { _id: 'm2' }, rating: 9, createdAt: null },
];
const version1 = computeProfileVersion({ _id: 'u_version' }, weirdDateReviews, []);
assert(
  typeof version1 === 'string' && version1.length === 16,
  'computeProfileVersion generates valid 16-char hash with invalid/null dates',
  `Got: ${version1}`
);


// ─────────────────────────────────────────────────────────────────────────────
// 5. SPARSE MOVIE METADATA
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 5: Sparse Movie Metadata ---');

const emptyMovie = {
  _id: 'sparse_empty',
  title: 'Sparse Movie 1',
  genres: [],
  language: null,
  industry: null,
  themes: null,
  moods: null,
  director: null,
};

const malformedMovie = {
  _id: 'sparse_malformed',
  title: 'Sparse Movie 2',
  genres: [null, undefined, '', 'Drama'],
  language: '',
  industry: '   ',
  themes: [null, 'Family'],
  moods: [],
  director: '   ',
};

const sparseReviews = [
  { movie: emptyMovie, rating: 10, createdAt: new Date() },
  { movie: malformedMovie, rating: 10, createdAt: new Date() },
];

let sparseProfile;
let sparseThrew = false;
try {
  sparseProfile = buildDeterministicTasteProfile({
    userDoc: { _id: 'u_sparse', preferences: {} },
    reviews: sparseReviews,
    watchlist: [],
  });
} catch (err) {
  sparseThrew = true;
  console.error('  Sparse metadata threw error:', err);
}

assert(!sparseThrew, 'buildDeterministicTasteProfile does NOT crash on sparse/malformed movie metadata');
assert(
  sparseProfile.topGenres.includes('Drama'),
  'Filtered valid genres ("Drama") extracted successfully from sparse data',
  `Got: ${JSON.stringify(sparseProfile?.topGenres)}`
);
assert(
  !sparseProfile.topGenres.includes(null) && !sparseProfile.topGenres.includes(''),
  'topGenres contains no null or empty string elements',
  `Got: ${JSON.stringify(sparseProfile?.topGenres)}`
);

// Check if formatIndustry returned 'Cinema' and polluted topIndustries
console.log('  [OBSERVATION] Sparse movie topIndustries:', sparseProfile.topIndustries);
assert(
  !sparseProfile.topIndustries.includes('Cinema'),
  'Sparse movie without language/industry does NOT pollute topIndustries with placeholder "Cinema"',
  `topIndustries contains placeholder: ${JSON.stringify(sparseProfile.topIndustries)}`
);


// ─────────────────────────────────────────────────────────────────────────────
// 6. NEUTRAL AVOIDED GENRES SEPARATION & LEAK PREVENTION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 6: Neutral Avoided Genres Separation & Leak Prevention ---');

// Test 6.1: Disliked genre should never appear in topGenres
const mixedUser = {
  _id: 'u_mixed_separation',
  preferences: { genres: ['Comedy'] },
  likedMovies: [
    { _id: 'm_c1', genres: ['Comedy'], language: 'te' },
    { _id: 'm_c2', genres: ['Comedy'], language: 'te' },
  ],
  dislikedMovies: [
    { _id: 'm_h1', genres: ['Horror'], language: 'en' },
    { _id: 'm_h2', genres: ['Horror'], language: 'en' },
  ],
};

const profileMixed = buildDeterministicTasteProfile({
  userDoc: mixedUser,
  reviews: [],
  watchlist: [],
});

assert(
  profileMixed.topGenres.includes('Comedy'),
  'Explicit + liked genre ("Comedy") in topGenres',
  `Got: ${JSON.stringify(profileMixed.topGenres)}`
);

assert(
  profileMixed.avoidedGenres.includes('Horror'),
  'Disliked genre ("Horror") in avoidedGenres',
  `Got: ${JSON.stringify(profileMixed.avoidedGenres)}`
);

assert(
  !profileMixed.topGenres.includes('Horror'),
  'Disliked genre ("Horror") strictly NOT in topGenres',
  `Got: ${JSON.stringify(profileMixed.topGenres)}`
);

assert(
  !profileMixed.avoidedGenres.includes('Comedy'),
  'Liked genre ("Comedy") strictly NOT in avoidedGenres',
  `Got: ${JSON.stringify(profileMixed.avoidedGenres)}`
);

// Test 6.2: Anti-hallucination validation rejects summary claiming avoided genre as positive
const badSummary = {
  headline: 'Horror and Comedy Fan',
  summary: 'This user absolutely loves Horror movies and frequently enjoys dark thrills.',
  highlights: ['Comedy', 'Horror'],
  confidence: 'high',
};

const validationResult = validateTasteProfileSummary(badSummary, profileMixed);
assert(
  validationResult.valid === false,
  'validateTasteProfileSummary REJECTS summary claiming avoided genre as favorite',
  `Expected valid=false, got valid=${validationResult.valid}, reason: ${validationResult.reason}`
);


// ─────────────────────────────────────────────────────────────────────────────
// 7. ZERO SCORE LEAKAGE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 7: Zero Score Leakage ---');

const leakySummary = {
  headline: 'Top Sci-Fi Profile',
  summary: 'User has cosineSimilarity of 0.85 and hybridScore of 0.92 with Action films.',
  highlights: ['Sci-Fi'],
  confidence: 'high',
};

const leakCheck = validateTasteProfileSummary(leakySummary, profileMixed);
assert(
  leakCheck.valid === false,
  'validateTasteProfileSummary REJECTS internal score / vector leakage',
  `Expected valid=false, got valid=${leakCheck.valid}, reason: ${leakCheck.reason}`
);

// Check that deterministic profile object itself has 0 floating-point numbers
const rawProfileKeys = Object.keys(profileMixed);
let foundFloats = false;
for (const key of rawProfileKeys) {
  const val = profileMixed[key];
  if (typeof val === 'number') {
    foundFloats = true;
    console.error(`  [LEAK] Profile contains raw numeric value: ${key} = ${val}`);
  }
}
assert(!foundFloats, 'Deterministic profile exposes 0 raw floating-point numbers to client');


// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY OF TEST RUN
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(` STRESS TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL ${passed + failed})`);
console.log('================================================================\n');

if (failed > 0) {
  console.log('FAILED TESTS:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`- ${r.testName}: ${r.details}`);
  });
}
