import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';

export async function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return next(new ApiError(401, 'Access denied. No token provided.'));
  }
  
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }

  try {
    // Security: Check if user exists in the database to prevent stateless token reuse for deleted accounts
    const userExists = await User.exists({ _id: decoded.id });
    if (!userExists) {
      return next(new ApiError(401, 'Access denied. User account no longer exists.'));
    }

    req.user = decoded;
    next();
  } catch (error) {
    return next(error);
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required.'));
  }
  next();
}

