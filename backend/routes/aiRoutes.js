import { Router } from 'express';
import { searchWithAI, getCacheStats, explainRecommendation, getTasteProfile } from '../controllers/aiController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply AI endpoint rate limiter
router.use(aiLimiter);

// GET /api/ai/taste-profile — Grounded Personal AI Taste Profile (auth-required)
router.get('/taste-profile', protect, getTasteProfile);

// POST /api/ai/search — Natural-Language AI Movie Discovery (auth-optional)
router.post('/search', optionalAuth, searchWithAI);

// POST /api/ai/explain-recommendation — Grounded Explainable Recommendation Engine (auth-optional, personalized requires auth)
router.post('/explain-recommendation', optionalAuth, explainRecommendation);

// GET /api/ai/cache-stats — Cache diagnostics
router.get('/cache-stats', getCacheStats);

export default router;
