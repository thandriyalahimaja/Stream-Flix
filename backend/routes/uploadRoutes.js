import { Router } from 'express';
import { uploadPoster, uploadBanner, uploadTrailer, uploadAvatar, deleteMedia } from '../controllers/uploadController.js';
import { auth, adminOnly } from '../middleware/auth.js';
import { uploadImage, uploadVideo } from '../middleware/multerMemory.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/poster', auth, adminOnly, uploadLimiter, uploadImage, uploadPoster);
router.post('/banner', auth, adminOnly, uploadLimiter, uploadImage, uploadBanner);
router.post('/trailer', auth, adminOnly, uploadLimiter, uploadVideo, uploadTrailer);
router.post('/avatar', auth, uploadLimiter, uploadImage, uploadAvatar);
router.delete('/:publicId(*)', auth, adminOnly, deleteMedia);

export default router;
