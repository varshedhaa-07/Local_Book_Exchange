import Book from '../models/Book.js';
import TradeRequest from '../models/TradeRequest.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();

  const [books, trades] = await Promise.all([
    Book.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).lean(),
    TradeRequest.find({
      $or: [{ requesterId: req.user._id }, { ownerId: req.user._id }],
    })
      .populate('requesterId', 'name email location')
      .populate('ownerId', 'name email location')
      .populate('bookId', 'title author genre condition image location ownerId')
      .populate('selectedOfferedBookId', 'title author genre condition image location ownerId')
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  res.json({ user, books, trades });
});
