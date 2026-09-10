# StreamFlix — Production Deployment Preparation Report

**Date**: September 10, 2026  
**Repository**: `thandriyalahimaja/Stream-Flix`  
**Branch**: `main`  
**Commit Hash**: `6e6a65e`  
**Push Status**: Successful (`c448240..6e6a65e main -> main`)

---

## 1. Local Verification Result
- **Hard Gate 1 & 2 Baselines**: Verified clean and operational.
- **Frontend Build**: Vite production build succeeded with 0 errors.
- **Backend Startup Hook**: `maybeRunMovieSync()` and `maybeRunIndianMovieSeed()` tested and verified.
- **Test Suites**: All 156 test assertions across 6 test suites passed 100%:
  - Phase 4A Hybrid Recommender (`evaluateRecommendations.js`): 18/18 Passed
  - Phase 4B Natural-Language AI Search (`evaluateAISearch.js`): 20/20 Passed
  - Phase 5 Grounded Explanations (`evaluateExplanations.js`): 20/20 Passed
  - Phase 6 AI Taste Profile (`evaluateTasteProfile.js`): 25/25 Passed
  - Phase 6 Edge-Case Stress Suite (`stressTestTasteProfile.js`): 42/42 Passed
  - Phase 6 Security & Multi-Tenancy Suite (`verifyTasteSecurityHarness.js`): 31/31 Passed

---

## 2. Git Staging & File Statistics
- **Staged & Committed Files**: 42 files
- **Total Changes**: 658,580 insertions(+), 281 deletions(-)
- **Excluded / Ignored File Categories**:
  - Environment files: `.env`, `.env.*`, `*.env`
  - Node dependencies: `node_modules/`, `backend/node_modules/`
  - Build & cache artifacts: `dist/`, `build/`, `.vite/`, `coverage/`, `*.log`
  - Raw candidate datasets: `datasets/` (50k Indian movies, raw dumps, zip files)
  - Temporary pipeline outputs & caches: `data/cache/`, `embedding_cache/`, `data/output/`
  - Local scratch & agent directories: `scratch/`, `.agents/`

---

## 3. Production Catalog & Seed Artifact Audit
- **Canonical Production Seed Path**: `data/production/streamflix_indian_seed.json`
- **Seed File Size**: 12.86 MB (well under GitHub's 100 MB limit)
- **Indian Movie Count**: Exactly 770 records
- **Vector Embeddings**: 770 / 770 (100%) valid 768-dimensional float vectors (`gemini-embedding-2-preview`, `phase3-v1`)
- **Stable Identifiers**: 770 valid IMDb IDs (100%), 770 valid TMDB IDs (100%)
- **Trailers**: 770 verified YouTube video IDs and enriched metadata (100%)
- **Legacy International Movies**: 82 non-overlapping movies
- **Total Production Catalog Target**: 82 + 770 = **852 total movies**
- **Idempotency**: Identity order (IMDb ID -> TMDB ID -> Title + Year). Preserves user interactions (`likes`, `dislikes`, `views`, `reviews`, `ratings`, `watchlist`) on updates without dropping collections.

---

## 4. Render Free-Plan Deployment Strategy
- **Free-Tier Constraint Compliance**:
  - Render Free Web Services do **not** support paid `preDeployCommand`.
  - **Selected Safe Strategy**: Minimal server startup initialization hook (`maybeRunIndianMovieSeed` and `maybeRunMovieSync` in `backend/server.js`).
  - Upon server boot, `SeedMeta` collection is checked. If `INDIAN_MOVIES_SEED_VERSION` (`2026-09-streamflix-indian-770-v1`) is already recorded, the hook completes in ~2ms without re-seeding.
  - If unseeded, the idempotent seed imports the 770 movies before `app.listen()` begins accepting traffic.
  - If seeding fails, the process logs a concise error and terminates with `process.exit(1)`, preventing the server from starting with a corrupted or partial catalog.
  - Direct CLI script also provided: `npm run seed:indian` in `backend/package.json`.

---

## 5. Secrets Audit Result
- **Audit Tool**: Automated regex scanner checking all staged files against patterns for Google Gemini keys, MongoDB Atlas connection strings, Cloudinary secrets, JWT secrets, private keys, and Trailerix keys.
- **Files Scanned**: 9,392 files
- **Violations Detected**: 0
- **Status**: **PASSED (Zero Secrets Detected)**

---

## 6. Environment Variable Names

### Render (Backend Web Service)
| Variable Name | Purpose | Expose to Frontend? |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | No |
| `PORT` | Set automatically by Render (default 5000) | No |
| `MONGO_URI` | MongoDB Atlas production connection string | **NEVER** |
| `JWT_SECRET` | Secret for signing access tokens | **NEVER** |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | **NEVER** |
| `JWT_EXPIRE` | Token expiry duration (e.g. `7d`) | No |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry duration (e.g. `30d`) | No |
| `CORS_ORIGIN` | Deployed Vercel frontend URL (e.g. `https://stream-flix.vercel.app`) | No |
| `GEMINI_API_KEY` | Google Gemini API key (server-side only) | **NEVER** |
| `GEMINI_FAST_MODEL` | Fast verbalizer model (`gemini-3.5-flash-lite`) | No |
| `GEMINI_EMBEDDING_MODEL` | Embedding model (`gemini-embedding-2-preview`) | No |
| `TRAILERIX_API_KEY` | Trailerix API key (server-side only) | **NEVER** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No |
| `CLOUDINARY_API_KEY` | Cloudinary public key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | **NEVER** |

### Vercel (Frontend Single-Page App)
| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public backend API URL | `https://streamflix-api.onrender.com/api` |

*Security Guardrail: MongoDB URI, JWT secrets, Gemini keys, Trailerix keys, and Cloudinary secrets MUST NOT be configured on Vercel.*

---

## 7. Deployment Instructions

### Step 1: Render Backend Service
1. Create a new **Web Service** on Render connected to `https://github.com/thandriyalahimaja/Stream-Flix`.
2. **Root Directory**: `backend`
3. **Runtime**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Configure the Render environment variables listed in Section 6.
7. Deploy the service and record the public backend URL (e.g., `https://streamflix-api.onrender.com`).

### Step 2: Vercel Frontend
1. Create a new **Project** on Vercel connected to `https://github.com/thandriyalahimaja/Stream-Flix`.
2. **Root Directory**: `./` (or `frontend` depending on project setup; root Vite configuration detects Vite).
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Set environment variable: `VITE_API_URL=https://<your-render-app>.onrender.com/api`.
6. Deploy the project and record the public frontend URL (e.g., `https://stream-flix.vercel.app`).

### Step 3: Configure CORS on Render
1. Return to Render Dashboard -> Environment.
2. Update `CORS_ORIGIN` to match your Vercel URL (e.g., `https://stream-flix.vercel.app`).
3. Save changes (Render will trigger an automatic zero-downtime redeploy).

---

## 8. Hard Stop Compliance
- Render deployment **not** triggered automatically.
- Vercel deployment **not** triggered automatically.
- No additional commits created.
