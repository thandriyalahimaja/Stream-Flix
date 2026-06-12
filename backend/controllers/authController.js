import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/generateToken.js';

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, genres } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, 'An account with this email already exists.');

  const hashed = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashed,
    preferences: { genres: genres || [] },
  });

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  // Persist refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Intentionally vague error to prevent account enumeration
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  // Rotate refresh token
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Invalidate refresh token in DB
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  }
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Logged out.' });
});

/**
 * POST /api/auth/refresh
 * Refresh token rotation — issue new access + refresh tokens.
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token.');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    // Token reuse detected — potential theft, invalidate all sessions
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    clearRefreshCookie(res);
    throw new ApiError(401, 'Refresh token has been revoked.');
  }

  // Rotate tokens
  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id, role: user.role });
  user.refreshToken = newRefreshToken;
  await user.save();

  setRefreshCookie(res, newRefreshToken);

  res.json({ success: true, accessToken: newAccessToken });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user with stats.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('likedMovies', 'title poster')
    .populate('trailerHistory.movie', 'title poster duration');

  if (!user) throw new ApiError(404, 'User not found.');

  // Aggregate stats
  const [watchlistCount, reviewCount] = await Promise.all([
    Watchlist.countDocuments({ user: user._id }),
    Review.countDocuments({ user: user._id }),
  ]);

  const userData = sanitizeUser(user);
  
  // Filter out any references to deleted movies and map to watchHistory for API contract compatibility
  const validTrailers = (user.trailerHistory || []).filter(h => h && h.movie !== null);
  userData.watchHistory = validTrailers.map(h => ({
    movie: h.movie,
    watchedAt: h.watchedAt
  }));
  userData.trailerHistory = validTrailers;

  userData.stats = {
    watchlistCount,
    reviewCount,
    watchHistoryCount: userData.watchHistory.length,
    likedCount: userData.likedMovies.length,
    totalWatchHours: user.totalWatchHours,
  };

  res.json({ success: true, user: userData });
});

/**
 * PUT /api/auth/password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new ApiError(404, 'User not found.');

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw new ApiError(401, 'Current password is incorrect.');

  user.password = await hashPassword(newPassword);
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

/**
 * Sanitize user object for API response — strip sensitive fields.
 */
function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
}
