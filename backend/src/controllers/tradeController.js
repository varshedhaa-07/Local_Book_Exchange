import crypto from 'crypto';
import Book from '../models/Book.js';
import TradeRequest from '../models/TradeRequest.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { syncMatchesForUser } from '../utils/matchmaker.js';
import { createNotification } from '../utils/notifications.js';

const EXCHANGE_CODE_EXPIRY_MS = 24 * 60 * 60 * 1000;
const EXCHANGE_CODE_LENGTH = 6;
const EXCHANGE_CODE_MAX_ATTEMPTS = 5;

const hashExchangeCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

const generateExchangeCode = () =>
  crypto.randomInt(0, 10 ** EXCHANGE_CODE_LENGTH).toString().padStart(EXCHANGE_CODE_LENGTH, '0');

const isTradeParticipant = (trade, userId) =>
  trade.requesterId.toString() === userId.toString() || trade.ownerId.toString() === userId.toString();

const isCodeExpired = (trade) =>
  !trade.exchangeCodeExpiresAt || new Date(trade.exchangeCodeExpiresAt).getTime() < Date.now();

const resetVerificationFlags = (trade) => {
  trade.requesterVerified = false;
  trade.ownerVerified = false;
  trade.requesterVerifiedAt = null;
  trade.ownerVerifiedAt = null;
};

const setTradeInProgressWithFreshCode = (trade) => {
  const exchangeCode = generateExchangeCode();

  trade.status = 'In Progress';
  trade.exchangeCode = exchangeCode;
  trade.exchangeCodeHash = hashExchangeCode(exchangeCode);
  trade.exchangeCodeExpiresAt = new Date(Date.now() + EXCHANGE_CODE_EXPIRY_MS);
  trade.exchangeCodeAttempts = 0;
  trade.exchangeCodeMaxAttempts = EXCHANGE_CODE_MAX_ATTEMPTS;
  resetVerificationFlags(trade);

  return exchangeCode;
};

const clearExchangeCodeOnly = (trade) => {
  trade.exchangeCode = '';
  trade.exchangeCodeHash = '';
  trade.exchangeCodeExpiresAt = null;
  trade.exchangeCodeAttempts = 0;
};

const clearExchangeState = (trade) => {
  clearExchangeCodeOnly(trade);
  resetVerificationFlags(trade);
};

const sanitizeTradeForClient = (trade, viewerId = null) => {
  const payload = trade.toObject ? trade.toObject() : trade;

  const requesterId = payload.requesterId?._id ? payload.requesterId._id.toString() : payload.requesterId?.toString?.();
  const viewer = viewerId ? viewerId.toString() : null;
  const canSeeExchangeCode = payload.status === 'In Progress' && viewer && requesterId && viewer === requesterId;

  if (!canSeeExchangeCode) {
    payload.exchangeCode = '';
  }

  delete payload.exchangeCodeHash;

  return payload;
};

const populateTrade = (trade) =>
  trade.populate([
    { path: 'requesterId', select: 'name email location' },
    { path: 'ownerId', select: 'name email location' },
    { path: 'bookId', select: 'title author genre condition image location ownerId' },
    { path: 'offeredBookIds', select: 'title author genre condition image location ownerId isAvailable' },
    {
      path: 'selectedOfferedBookId',
      select: 'title author genre condition image location ownerId isAvailable',
    },
  ]);

const getReservedBookIds = async () => {
  const activeTrades = await TradeRequest.find(
    { status: { $in: ['Pending', 'In Progress'] } },
    'bookId selectedOfferedBookId',
  ).lean();

  const reserved = new Set();

  for (const trade of activeTrades) {
    if (trade.bookId) {
      reserved.add(trade.bookId.toString());
    }

    if (trade.selectedOfferedBookId) {
      reserved.add(trade.selectedOfferedBookId.toString());
    }
  }

  return reserved;
};

const handleExpiredCodeReset = async (tradeRequest) => {
  clearExchangeState(tradeRequest);
  await tradeRequest.save();
};

const completeTrade = async (tradeRequest, actorId) => {
  tradeRequest.status = 'Completed';
  clearExchangeCodeOnly(tradeRequest);

  await Promise.all([
    createNotification({
      userId: tradeRequest.requesterId,
      actorId,
      type: 'TRADE_COMPLETED',
      message: 'Trade completed after owner verified OTP',
      link: '/trade-requests',
      metadata: {
        tradeRequestId: tradeRequest._id,
        bookId: tradeRequest.bookId,
        selectedOfferedBookId: tradeRequest.selectedOfferedBookId,
      },
    }),
    createNotification({
      userId: tradeRequest.ownerId,
      actorId,
      type: 'TRADE_COMPLETED',
      message: 'Trade completed after owner verified OTP',
      link: '/trade-requests',
      metadata: {
        tradeRequestId: tradeRequest._id,
        bookId: tradeRequest.bookId,
        selectedOfferedBookId: tradeRequest.selectedOfferedBookId,
      },
    }),
  ]);

  return 'Trade completed successfully';
};

export const createTradeRequest = asyncHandler(async (req, res) => {
  const { bookId, ownerId } = req.body;

  if (!bookId || !ownerId) {
    res.status(400);
    throw new Error('Book and owner are required');
  }

  if (ownerId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot request your own book');
  }

  const requestedBook = await Book.findById(bookId);
  if (!requestedBook) {
    res.status(404);
    throw new Error('Requested book not found');
  }

  if (requestedBook.isAvailable === false) {
    res.status(400);
    throw new Error('Requested book is no longer available');
  }

  if (requestedBook.ownerId.toString() !== ownerId.toString()) {
    res.status(400);
    throw new Error('Owner does not match the requested book');
  }

  const reservedBookIds = await getReservedBookIds();

  if (reservedBookIds.has(requestedBook._id.toString())) {
    res.status(400);
    throw new Error('Requested book is already involved in another active exchange');
  }

  const existingRequest = await TradeRequest.findOne({
    requesterId: req.user._id,
    ownerId,
    bookId,
    status: { $in: ['Pending', 'In Progress'] },
  });

  if (existingRequest) {
    res.status(400);
    throw new Error('Trade request already exists for this book');
  }

  const myAvailableBooks = await Book.find({
    ownerId: req.user._id,
    isAvailable: true,
  }).select('_id title');

  const offeredBookIds = myAvailableBooks
    .map((book) => book._id)
    .filter((id) => !reservedBookIds.has(id.toString()));

  if (!offeredBookIds.length) {
    res.status(400);
    throw new Error('You need at least one available book to offer for exchange');
  }

  const tradeRequest = await TradeRequest.create({
    requesterId: req.user._id,
    ownerId,
    bookId,
    offeredBookIds,
    requesterApproval: true,
    ownerApproval: false,
    status: 'Pending',
  });

  await Book.findByIdAndUpdate(bookId, {
    $addToSet: { interestedUserIds: req.user._id },
  });

  await createNotification({
    userId: ownerId,
    actorId: req.user._id,
    type: 'TRADE_REQUEST',
    message: `${req.user.name} requested "${requestedBook.title}" and shared ${offeredBookIds.length} offer book(s)`,
    link: '/trade-requests',
    metadata: {
      tradeRequestId: tradeRequest._id,
      bookId: requestedBook._id,
    },
  });

  await populateTrade(tradeRequest);

  await syncMatchesForUser(req.user._id);
  await syncMatchesForUser(ownerId);

  res.status(201).json(sanitizeTradeForClient(tradeRequest, req.user._id));
});

export const respondToTrade = asyncHandler(async (req, res) => {
  const { requestId, action, selectedOfferedBookId } = req.body;

  if (!requestId || !action) {
    res.status(400);
    throw new Error('Request id and action are required');
  }

  const normalizedAction = action.toLowerCase();

  if (!['accept', 'cancel', 'reject'].includes(normalizedAction)) {
    res.status(400);
    throw new Error('Invalid action. Use accept or cancel');
  }

  const tradeRequest = await TradeRequest.findById(requestId);

  if (!tradeRequest) {
    res.status(404);
    throw new Error('Trade request not found');
  }

  const isRequester = tradeRequest.requesterId.toString() === req.user._id.toString();
  const isOwner = tradeRequest.ownerId.toString() === req.user._id.toString();

  if (!isRequester && !isOwner) {
    res.status(403);
    throw new Error('You are not allowed to respond to this request');
  }

  if (tradeRequest.status === 'Completed') {
    res.status(400);
    throw new Error('Completed exchanges cannot be modified');
  }

  const notificationRecipientId = isOwner ? tradeRequest.requesterId : tradeRequest.ownerId;

  if (normalizedAction === 'cancel' || normalizedAction === 'reject') {
    const selectedBookToRelease = tradeRequest.selectedOfferedBookId;

    tradeRequest.status = 'Cancelled';
    tradeRequest.requesterApproval = false;
    tradeRequest.ownerApproval = false;
    tradeRequest.selectedOfferedBookId = null;
    clearExchangeState(tradeRequest);

    await tradeRequest.save();

    const releaseIds = [tradeRequest.bookId, selectedBookToRelease].filter(Boolean);
    if (releaseIds.length) {
      await Book.updateMany({ _id: { $in: releaseIds } }, { isAvailable: true });
    }

    await createNotification({
      userId: notificationRecipientId,
      actorId: req.user._id,
      type: 'TRADE_CANCELLED',
      message: `${req.user.name} cancelled the trade request`,
      link: '/trade-requests',
      metadata: {
        tradeRequestId: tradeRequest._id,
        bookId: tradeRequest.bookId,
      },
    });
  }

  if (normalizedAction === 'accept') {
    if (!isOwner) {
      res.status(400);
      throw new Error('Only the requested book owner can finalize the swap selection');
    }

    if (!selectedOfferedBookId) {
      res.status(400);
      throw new Error('Select exactly one offered book to accept this exchange');
    }

    if (!tradeRequest.offeredBookIds.map((id) => id.toString()).includes(selectedOfferedBookId.toString())) {
      res.status(400);
      throw new Error('Selected book is not in requester offer list');
    }

    const selectedBook = await Book.findById(selectedOfferedBookId);

    if (!selectedBook || selectedBook.ownerId.toString() !== tradeRequest.requesterId.toString()) {
      res.status(400);
      throw new Error('Selected offered book is invalid');
    }

    if (selectedBook.isAvailable === false) {
      res.status(400);
      throw new Error('Selected offered book is no longer available');
    }

    const reservedBookIds = await getReservedBookIds();
    const isSelectedReservedElsewhere = reservedBookIds.has(selectedBook._id.toString());

    if (isSelectedReservedElsewhere) {
      const conflicting = await TradeRequest.findOne({
        _id: { $ne: tradeRequest._id },
        status: { $in: ['Pending', 'In Progress'] },
        $or: [{ bookId: selectedBook._id }, { selectedOfferedBookId: selectedBook._id }],
      }).lean();

      if (conflicting) {
        res.status(400);
        throw new Error('Selected offered book is already part of another active exchange');
      }
    }

    tradeRequest.ownerApproval = true;
    tradeRequest.requesterApproval = true;
    tradeRequest.selectedOfferedBookId = selectedBook._id;

    const exchangeCode = setTradeInProgressWithFreshCode(tradeRequest);
    await tradeRequest.save();

    await Book.updateMany(
      {
        _id: { $in: [tradeRequest.bookId, selectedBook._id] },
      },
      {
        isAvailable: false,
        interestedUserIds: [],
      },
    );

    await TradeRequest.updateMany(
      {
        _id: { $ne: tradeRequest._id },
        status: { $in: ['Pending'] },
        $or: [
          { bookId: { $in: [tradeRequest.bookId, selectedBook._id] } },
          { selectedOfferedBookId: { $in: [tradeRequest.bookId, selectedBook._id] } },
        ],
      },
      {
        status: 'Cancelled',
        requesterApproval: false,
        ownerApproval: false,
      },
    );

    await Promise.all([
      createNotification({
        userId: tradeRequest.requesterId,
        actorId: req.user._id,
        type: 'TRADE_IN_PROGRESS',
        message: `Exchange started. OTP: ${exchangeCode}`,
        link: '/trade-requests',
        metadata: {
          tradeRequestId: tradeRequest._id,
          bookId: tradeRequest.bookId,
          selectedOfferedBookId: selectedBook._id,
        },
      }),
      createNotification({
        userId: tradeRequest.ownerId,
        actorId: req.user._id,
        type: 'TRADE_IN_PROGRESS',
        message: 'Exchange started. Request OTP from the swap initiator during meetup.',
        link: '/trade-requests',
        metadata: {
          tradeRequestId: tradeRequest._id,
          bookId: tradeRequest.bookId,
          selectedOfferedBookId: selectedBook._id,
        },
      }),
    ]);
  }

  await populateTrade(tradeRequest);

  await syncMatchesForUser(tradeRequest.requesterId._id);
  await syncMatchesForUser(tradeRequest.ownerId._id);

  res.json(sanitizeTradeForClient(tradeRequest, req.user._id));
});

export const verifyExchangeCode = asyncHandler(async (req, res) => {
  const { requestId, code } = req.body;

  if (!requestId || !code) {
    res.status(400);
    throw new Error('Request id and exchange code are required');
  }

  const tradeRequest = await TradeRequest.findById(requestId);

  if (!tradeRequest) {
    res.status(404);
    throw new Error('Trade request not found');
  }

  if (!isTradeParticipant(tradeRequest, req.user._id)) {
    res.status(403);
    throw new Error('You are not allowed to verify this exchange');
  }

  if (tradeRequest.status !== 'In Progress') {
    res.status(400);
    throw new Error('Exchange is not in progress');
  }

  if (isCodeExpired(tradeRequest)) {
    await handleExpiredCodeReset(tradeRequest);
    res.status(400);
    throw new Error('OTP expired. Verification reset. Regenerate a new OTP');
  }

  if (tradeRequest.exchangeCodeAttempts >= tradeRequest.exchangeCodeMaxAttempts) {
    res.status(429);
    throw new Error('OTP is locked after too many attempts. Regenerate OTP');
  }

  const isRequester = tradeRequest.requesterId.toString() === req.user._id.toString();
  const isOwner = tradeRequest.ownerId.toString() === req.user._id.toString();

  if (isRequester) {
    res.status(403);
    throw new Error('Swap initiator does not need to enter OTP');
  }

  if (!isOwner) {
    res.status(403);
    throw new Error('Only the other user can verify OTP');
  }

  if (tradeRequest.ownerVerified) {
    res.status(400);
    throw new Error('OTP already verified for this exchange');
  }

  const submittedCodeHash = hashExchangeCode(String(code).trim());

  if (submittedCodeHash !== tradeRequest.exchangeCodeHash) {
    tradeRequest.exchangeCodeAttempts += 1;

    if (tradeRequest.exchangeCodeAttempts >= tradeRequest.exchangeCodeMaxAttempts) {
      tradeRequest.exchangeCodeExpiresAt = new Date();
    }

    await tradeRequest.save();

    res.status(400);
    throw new Error('Invalid OTP');
  }

  tradeRequest.ownerVerified = true;
  tradeRequest.ownerVerifiedAt = new Date();
  tradeRequest.requesterVerified = true;
  tradeRequest.requesterVerifiedAt = tradeRequest.requesterVerifiedAt || new Date();
  tradeRequest.exchangeCodeAttempts = 0;

  const statusMessage = await completeTrade(tradeRequest, req.user._id);

  await tradeRequest.save();

  await populateTrade(tradeRequest);

  await syncMatchesForUser(tradeRequest.requesterId._id);
  await syncMatchesForUser(tradeRequest.ownerId._id);

  res.json({
    tradeRequest: sanitizeTradeForClient(tradeRequest, req.user._id),
    message: statusMessage,
  });
});

export const regenerateExchangeCode = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    res.status(400);
    throw new Error('Request id is required');
  }

  const tradeRequest = await TradeRequest.findById(requestId);

  if (!tradeRequest) {
    res.status(404);
    throw new Error('Trade request not found');
  }

  if (!isTradeParticipant(tradeRequest, req.user._id)) {
    res.status(403);
    throw new Error('You are not allowed to regenerate this OTP');
  }

  if (tradeRequest.requesterId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the swap initiator can regenerate OTP');
  }

  if (tradeRequest.status !== 'In Progress') {
    res.status(400);
    throw new Error('OTP regeneration is only available in In Progress state');
  }

  if (!isCodeExpired(tradeRequest) && tradeRequest.exchangeCodeAttempts < tradeRequest.exchangeCodeMaxAttempts) {
    res.status(400);
    throw new Error('Current OTP is still active');
  }

  const exchangeCode = setTradeInProgressWithFreshCode(tradeRequest);
  await tradeRequest.save();

  await Promise.all([
    createNotification({
      userId: tradeRequest.requesterId,
      actorId: req.user._id,
      type: 'TRADE_IN_PROGRESS',
      message: `OTP regenerated: ${exchangeCode}`,
      link: '/trade-requests',
      metadata: {
        tradeRequestId: tradeRequest._id,
        bookId: tradeRequest.bookId,
        selectedOfferedBookId: tradeRequest.selectedOfferedBookId,
      },
    }),
    createNotification({
      userId: tradeRequest.ownerId,
      actorId: req.user._id,
      type: 'TRADE_IN_PROGRESS',
      message: 'OTP was regenerated. Request the updated code from the swap initiator.',
      link: '/trade-requests',
      metadata: {
        tradeRequestId: tradeRequest._id,
        bookId: tradeRequest.bookId,
        selectedOfferedBookId: tradeRequest.selectedOfferedBookId,
      },
    }),
  ]);

  await populateTrade(tradeRequest);

  res.json(sanitizeTradeForClient(tradeRequest, req.user._id));
});

export const getUserTrades = asyncHandler(async (req, res) => {
  const tradeRequests = await TradeRequest.find({
    $or: [{ requesterId: req.user._id }, { ownerId: req.user._id }],
  })
    .populate('requesterId', 'name email location')
    .populate('ownerId', 'name email location')
    .populate('bookId', 'title author genre condition image location ownerId')
    .populate('offeredBookIds', 'title author genre condition image location ownerId isAvailable')
    .populate('selectedOfferedBookId', 'title author genre condition image location ownerId isAvailable')
    .sort({ createdAt: -1 });

  const sanitizedTrades = tradeRequests.map((trade) => sanitizeTradeForClient(trade, req.user._id));

  res.json(sanitizedTrades);
});











