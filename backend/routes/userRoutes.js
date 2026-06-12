import { Router } from 'express';
import { getProfile, updateProfile, getWatchHistory, addToWatchHistory, toggleLike, toggleDislike, getDashboardStats } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { updateProfileRules } from '../validators/userValidators.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileRules, validate, updateProfile);
router.get('/history', auth, getWatchHistory);
router.post('/history', auth, addToWatchHistory);
router.post('/like/:movieId', auth, toggleLike);
router.post('/dislike/:movieId', auth, toggleDislike);
router.get('/dashboard', auth, getDashboardStats);

export default router;
