import Match from '../models/Match.js';
import Book from '../models/Book.js';
import TradeRequest from '../models/TradeRequest.js';

export const syncMatchesForUser = async (userId) => {
  const requests = await TradeRequest.find({
    $or: [{ requesterId: userId }, { ownerId: userId }],
    status: { $in: ['Pending'] },
  }).lean();

  const outgoing = requests.filter((request) => request.requesterId.toString() === userId.toString());
  const incoming = requests.filter((request) => request.ownerId.toString() === userId.toString());

  for (const outRequest of outgoing) {
    for (const inRequest of incoming) {
      if (outRequest.ownerId.toString() !== inRequest.requesterId.toString()) {
        continue;
      }

      const [requestedBook, offeredBook] = await Promise.all([
        Book.findById(outRequest.bookId).lean(),
        Book.findById(inRequest.bookId).lean(),
      ]);

      if (!requestedBook || !offeredBook || requestedBook.isAvailable === false || offeredBook.isAvailable === false) {
        continue;
      }

      const orderedIds = [outRequest.requesterId.toString(), outRequest.ownerId.toString()].sort();
      await Match.findOneAndUpdate(
        { userA: orderedIds[0], userB: orderedIds[1] },
        {
          userA: orderedIds[0],
          userB: orderedIds[1],
          $addToSet: {
            matchedBooks: {
              requestedBook: requestedBook._id,
              offeredBook: offeredBook._id,
            },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }
};
