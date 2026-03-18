import mongoose from 'mongoose';

const tradeRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    offeredBookIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    selectedOfferedBookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    requesterApproval: {
      type: Boolean,
      default: true,
    },
    ownerApproval: {
      type: Boolean,
      default: false,
    },
    exchangeCode: {
      type: String,
      default: '',
      trim: true,
    },
    exchangeCodeHash: {
      type: String,
      default: '',
    },
    exchangeCodeExpiresAt: {
      type: Date,
      default: null,
    },
    exchangeCodeAttempts: {
      type: Number,
      default: 0,
    },
    exchangeCodeMaxAttempts: {
      type: Number,
      default: 5,
    },
    requesterVerified: {
      type: Boolean,
      default: false,
    },
    ownerVerified: {
      type: Boolean,
      default: false,
    },
    requesterVerifiedAt: {
      type: Date,
      default: null,
    },
    ownerVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const TradeRequest = mongoose.model('TradeRequest', tradeRequestSchema);

export default TradeRequest;
