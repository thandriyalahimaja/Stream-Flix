import { Router } from 'express';
import { getAll, getById, search, getByGenre, getTrending, getRecommended, create, update, remove } from '../controllers/movieController.js';
import { auth, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public endpoints
router.get('/', getAll);
router.get('/search', search);
router.get('/genre', getByGenre);
router.get('/trending', getTrending);

// Auth-optional: personalised for logged-in users, top-rated fallback for guests
router.get('/recommended', optionalAuth, getRecommended);

// Must come after named routes
router.get('/:id', getById);

// Admin only
import { movieRules } from '../validators/movieValidators.js';
import { validate } from '../middleware/validate.js';

router.post('/', auth, adminOnly, movieRules, validate, create);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);

export default router;
