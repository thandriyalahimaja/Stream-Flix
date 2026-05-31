import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * GET /api/reviews/:movieId — reviews for a movie with pagination
 */
export const getByMovie = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { movie: req.params.movieId };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  res.json({ success: true, data: reviews, total });
});

/**
 * POST /api/reviews — create or update review (upsert per user per movie)
 */
export const create = asyncHandler(async (req, res) => {
  const { movieId, rating } = req.body;
  const content = req.body.content || req.body.comment;

  if (!rating || rating < 1 || rating > 10) {
    throw new ApiError(400, 'Rating must be between 1 and 10.');
  }

  let review = await Review.findOne({ user: req.user.id, movie: movieId });

  if (review) {
    review.rating = rating;
    review.content = content || '';
    await review.save();
  } else {
    review = await Review.create({
      user: req.user.id,
      movie: movieId,
      rating,
      content: content || '',
    });
  }

  // Recalculate movie aggregate rating
  const agg = await Review.aggregate([
    { $match: { movie: review.movie } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (agg.length) {
    await Movie.findByIdAndUpdate(movieId, {
      avgUserRating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count,
    });
  }

  const populated = await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, data: populated });
});

/**
 * DELETE /api/reviews/:id — delete own review
 */
export const remove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this review.');
  }

  const movieId = review.movie;
  await Review.findByIdAndDelete(req.params.id);

  // Recalculate movie stats
  const agg = await Review.aggregate([
    { $match: { movie: movieId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Movie.findByIdAndUpdate(movieId, {
    avgUserRating: agg.length ? Math.round(agg[0].avg * 10) / 10 : 0,
    reviewCount: agg.length ? agg[0].count : 0,
  });

  res.json({ success: true, message: 'Review deleted.' });
});
