import { Router } from 'express';
import { getList, addItem, removeItem } from '../controllers/watchlistController.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.get('/', auth, getList);
router.post('/', auth, addItem);
router.delete('/:movieId', auth, removeItem);
export default router;
