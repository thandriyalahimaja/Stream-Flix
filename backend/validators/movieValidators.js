import { body } from 'express-validator';

export const movieRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('year').isInt({ min: 1900, max: 2030 }).withMessage('Valid year required'),
  body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  body('genres').isArray({ min: 1 }).withMessage('At least one genre required'),
];
