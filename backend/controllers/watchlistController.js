import Watchlist from '../models/Watchlist.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getList = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ user: req.user.id }).populate('movie').sort('-addedAt');
  res.json({ success: true, data: items });
});

export const addItem = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  const exists = await Watchlist.findOne({ user: req.user.id, movie: movieId });
  if (exists) throw new ApiError(400, 'Already in watchlist.');
  const item = await Watchlist.create({ user: req.user.id, movie: movieId });
  res.status(201).json({ success: true, data: item });
});

export const removeItem = asyncHandler(async (req, res) => {
  await Watchlist.findOneAndDelete({ user: req.user.id, movie: req.params.movieId });
  res.json({ success: true, message: 'Removed from watchlist.' });
});
