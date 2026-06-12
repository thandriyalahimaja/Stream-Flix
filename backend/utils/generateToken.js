import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Set refresh token as httpOnly cookie.
 */
export function setRefreshCookie(res, token) {
  const req = res.req;
  const host = req ? req.get('host') : '';
  const isLocalhost = host && (host.includes('localhost') || host.includes('127.0.0.1'));
  
  const secure = !isLocalhost;
  const sameSite = isLocalhost ? 'lax' : 'none';

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
}

/**
 * Clear refresh token cookie.
 */
export function clearRefreshCookie(res) {
  const req = res.req;
  const host = req ? req.get('host') : '';
  const isLocalhost = host && (host.includes('localhost') || host.includes('127.0.0.1'));
  
  const secure = !isLocalhost;
  const sameSite = isLocalhost ? 'lax' : 'none';

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 0,
    path: '/',
  });
}

