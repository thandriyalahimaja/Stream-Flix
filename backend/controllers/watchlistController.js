import Watchlist from '../models/Watchlist.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getList = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ user: req.user.id }).populate('movie').sort('-addedAt');
  res.json({ success: true, data: items });
});

export const addItem = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  try {
    const exists = await Watchlist.findOne({ user: req.user.id, movie: movieId });
    if (exists) {
      return res.status(200).json({ success: true, data: exists, message: 'Already in watchlist.' });
    }
    const item = await Watchlist.create({ user: req.user.id, movie: movieId });

    // Log watchlist activity
    await Activity.create({
      user: req.user.id,
      type: 'watchlist',
      movie: movieId,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) {
      const existingItem = await Watchlist.findOne({ user: req.user.id, movie: movieId });
      return res.status(200).json({ success: true, data: existingItem, message: 'Already in watchlist.' });
    }
    throw error;
  }
});

export const removeItem = asyncHandler(async (req, res) => {
  await Watchlist.findOneAndDelete({ user: req.user.id, movie: req.params.movieId });
  res.json({ success: true, message: 'Removed from watchlist.' });
});
