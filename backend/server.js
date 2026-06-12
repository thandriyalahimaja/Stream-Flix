import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { maybeRunMovieSync } from './seed/syncMovies.js';
import { maybeRunAdminSeed } from './seed/seedAdmin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import userRoutes from './routes/userRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';


const app = express();

/**
 * Security headers via Helmet.
 * Content Security Policy (CSP) is configured to allow:
 *   - YouTube iframe embeds for movie trailers (www.youtube.com, www.youtube-nocookie.com)
 *   - TMDB image CDN for poster and backdrop images
 *   - Cloudinary CDN for user-uploaded media
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://image.tmdb.org',       // TMDB poster and backdrop images
          'https://res.cloudinary.com',   // Cloudinary user-uploaded media
          'https://images.unsplash.com',  // Fallback images
        ],
        frameSrc: [
          'https://www.youtube.com',          // YouTube trailer embeds
          'https://www.youtube-nocookie.com', // YouTube privacy-enhanced mode
        ],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'", 'https://res.cloudinary.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      },
    },
  })
);

// Cross-origin resource sharing — allow frontend origin with credentials
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// General API rate limiting for platform endpoints
app.use('/api', apiLimiter);

// HTTP request logging — concise in production, verbose in development
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing for httpOnly refresh tokens
app.use(cookieParser());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);


// Health check endpoint — useful for deployment and monitoring
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all 404 for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler — must be registered last
app.use(errorHandler);

// ─── Server Startup ───────────────────────────────────────────────────────────
async function startServer() {
  await connectDB();
  await maybeRunMovieSync();
  await maybeRunAdminSeed();
  app.listen(env.PORT, () => {
    console.log(`🌊 StreamFlix API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
