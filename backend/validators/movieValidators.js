import { body } from 'express-validator';

const currentYear = new Date().getFullYear();

// Helper to parse/validate duration
function isValidDuration(duration) {
  if (typeof duration === 'number') {
    return duration >= 1 && duration <= 500;
  }
  if (typeof duration !== 'string' || !duration.trim()) return false;
  
  // Format check: "Xh Ym", "Xh", "Ym", or just raw digits
  const hrMatch = duration.match(/(\d+)\s*h/);
  const minMatch = duration.match(/(\d+)\s*m/);
  
  let totalMinutes = 0;
  if (hrMatch) {
    totalMinutes += parseInt(hrMatch[1], 10) * 60;
  }
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10);
  }
  
  if (!hrMatch && !minMatch) {
    const rawNum = parseInt(duration, 10);
    if (isNaN(rawNum)) return false;
    totalMinutes = rawNum;
  }
  
  return totalMinutes >= 1 && totalMinutes <= 500;
}

export const movieRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),

  body('synopsis')
    .trim()
    .notEmpty()
    .withMessage('Synopsis is required')
    .isLength({ max: 2000 })
    .withMessage('Synopsis must be less than 2000 characters'),

  body('director')
    .trim()
    .notEmpty()
    .withMessage('Director is required'),

  body('year')
    .isInt({ min: 1888, max: currentYear + 1 })
    .withMessage(`Year must be between 1888 and ${currentYear + 1}`),

  body('rating')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),

  body('duration')
    .custom((val) => {
      if (!isValidDuration(val)) {
        throw new Error('Duration must be between 1 and 500 minutes (e.g., "2h 30m" or "150")');
      }
      return true;
    }),

  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),

  body('genres.*')
    .trim()
    .notEmpty()
    .withMessage('Genre name cannot be empty'),

  body('youtubeId')
    .trim()
    .matches(/^[a-zA-Z0-9_-]{11}$/)
    .withMessage('YouTube Video ID must be exactly 11 characters (no full URLs allowed)'),

  body('poster.url')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Poster must have a valid URL'),

  body('backdrop.url')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Backdrop must have a valid URL'),
];
