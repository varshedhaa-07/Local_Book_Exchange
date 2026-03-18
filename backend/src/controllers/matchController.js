import Match from '../models/Match.js';
import TradeRequest from '../models/TradeRequest.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { syncMatchesForUser } from '../utils/matchmaker.js';

export const getMatches = asyncHandler(async (req, res) => {
  await syncMatchesForUser(req.user._id);

  const [suggestedMatches, inProgressTrades] = await Promise.all([
    Match.find({
      $or: [{ userA: req.user._id }, { userB: req.user._id }],
    })
      .populate('userA', 'name location email')
      .populate('userB', 'name location email')
      .populate('matchedBooks.requestedBook', 'title author genre condition image location ownerId')
      .populate('matchedBooks.offeredBook', 'title author genre condition image location ownerId')
      .sort({ updatedAt: -1 }),
    TradeRequest.find({
      $or: [{ requesterId: req.user._id }, { ownerId: req.user._id }],
      status: 'In Progress',
      selectedOfferedBookId: { $ne: null },
    })
      .populate('requesterId', 'name location email')
      .populate('ownerId', 'name location email')
      .populate('bookId', 'title author genre condition image location ownerId')
      .populate('selectedOfferedBookId', 'title author genre condition image location ownerId')
      .sort({ updatedAt: -1 }),
  ]);

  const acceptedMatches = inProgressTrades.map((trade) => ({
    _id: `trade-${trade._id}`,
    userA: trade.requesterId,
    userB: trade.ownerId,
    status: 'In Progress',
    sourceTradeId: trade._id,
    matchedBooks: [
      {
        requestedBook: trade.bookId,
        offeredBook: trade.selectedOfferedBookId,
      },
    ],
    updatedAt: trade.updatedAt,
  }));

  res.json([...acceptedMatches, ...suggestedMatches]);
});
