import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// Safe image types: strictly jpeg, png, webp. No SVG, no GIF.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

// Safe video types: mp4, mov, webm.
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const VIDEO_EXTS = ['.mp4', '.mov', '.webm'];

const storage = multer.memoryStorage();

function fileFilter(allowedTypes, allowedExts) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // 1. Audit extension
    if (!allowedExts.includes(ext)) {
      return cb(new ApiError(400, `Invalid file extension: "${ext}". Allowed: ${allowedExts.join(', ')}`));
    }
    
    // 2. Audit MIME type
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Invalid MIME type: "${file.mimetype}". Allowed: ${allowedTypes.join(', ')}`));
    }
  };
}

/**
 * Image upload middleware — max 10MB
 */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(IMAGE_TYPES, IMAGE_EXTS),
}).single('file');

/**
 * Video upload middleware — max 100MB
 */
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter(VIDEO_TYPES, VIDEO_EXTS),
}).single('file');

/**
 * General media upload middleware — max 100MB
 */
export const uploadMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter([...IMAGE_TYPES, ...VIDEO_TYPES], [...IMAGE_EXTS, ...VIDEO_EXTS]),
}).single('file');
