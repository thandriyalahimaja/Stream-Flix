import { body } from 'express-validator';

export const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
];
