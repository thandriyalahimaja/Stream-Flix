import { Router } from 'express';
import { register, login, logout, refresh, getMe, changePassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerRules, loginRules } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', auth, logout);
router.post('/refresh', refresh); // Uses httpOnly cookie, no auth middleware
router.get('/me', auth, getMe);
router.put('/password', auth, changePassword);

export default router;
