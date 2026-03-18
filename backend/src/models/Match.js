import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchedBooks: [
      {
        requestedBook: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        offeredBook: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const Match = mongoose.model('Match', matchSchema);

export default Match;
