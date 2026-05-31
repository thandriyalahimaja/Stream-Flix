import { Router } from 'express';
import { getByMovie, create, remove } from '../controllers/reviewController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/:movieId', getByMovie);
router.post('/', auth, create);
router.delete('/:id', auth, remove);

export default router;
