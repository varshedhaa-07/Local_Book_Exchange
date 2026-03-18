import { useState } from 'react';
import { formatDate } from '../utils/formatters';

export default function TradeRequestCard({
  trade,
  currentUserId,
  onRespond,
  onVerifyCode,
  onRegenerateCode,
}) {
  const isOwner = trade.ownerId?._id === currentUserId;
  const isRequester = trade.requesterId?._id === currentUserId;
  const [otp, setOtp] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(trade.selectedOfferedBookId?._id || '');

  const isPending = trade.status === 'Pending';
  const inProgress = trade.status === 'In Progress';
  const isCompleted = trade.status === 'Completed';

  const myVerified = isRequester ? trade.requesterVerified : trade.ownerVerified;
  const otherVerified = isRequester ? trade.ownerVerified : trade.requesterVerified;

  const offeredBooks = (trade.offeredBookIds || []).filter((book) => book?.isAvailable !== false);

  return (
    <article className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-coral">{trade.status}</p>
          <h3 className="mt-2 text-2xl font-bold text-ink">{trade.bookId?.title}</h3>
          <p className="mt-1 text-sm text-ink/70">by {trade.bookId?.author}</p>
        </div>
        <p className="text-sm text-ink/60">{formatDate(trade.createdAt)}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Requester</p>
          <p className="mt-2 font-semibold text-ink">{trade.requesterId?.name}</p>
          <p className="text-sm text-ink/60">{trade.requesterId?.location}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Owner</p>
          <p className="mt-2 font-semibold text-ink">{trade.ownerId?.name}</p>
          <p className="text-sm text-ink/60">{trade.ownerId?.location}</p>
        </div>
      </div>

      {isPending && isOwner ? (
        <div className="mt-5 rounded-2xl bg-mist p-4">
          <p className="text-sm font-semibold text-ink">Requester Offer List</p>
          <p className="mt-1 text-sm text-ink/75">Select exactly one offered book to accept this exchange.</p>

          <div className="mt-3 space-y-2">
            {offeredBooks.length ? (
              offeredBooks.map((book) => (
                <label key={book._id} className="flex items-start gap-3 rounded-xl bg-white px-3 py-2">
                  <input
                    type="radio"
                    name={`offered-book-${trade._id}`}
                    value={book._id}
                    checked={selectedBookId === book._id}
                    onChange={(event) => setSelectedBookId(event.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-ink">{book.title}</p>
                    <p className="text-sm text-ink/70">{book.author}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-ink/70">No available offered books.</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onRespond(trade._id, 'accept', selectedBookId)}
              disabled={!selectedBookId}
              className="rounded-full bg-spruce px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Accept Exchange
            </button>
            <button
              type="button"
              onClick={() => onRespond(trade._id, 'cancel')}
              className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {isPending && isRequester ? (
        <div className="mt-5 rounded-2xl bg-mist p-4">
          <p className="text-sm text-ink/80">Waiting for owner to pick one offered book and accept.</p>
          <button
            type="button"
            onClick={() => onRespond(trade._id, 'cancel')}
            className="mt-3 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white"
          >
            Cancel Request
          </button>
        </div>
      ) : null}

      {inProgress ? (
        <div className="mt-5 rounded-2xl bg-mist p-4">
          <p className="text-sm font-semibold text-ink">OTP Verification</p>
          <p className="mt-1 text-sm text-ink/75">Only the owner enters OTP during exchange.</p>

          <div className="mt-3 rounded-xl bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Exchange Code</p>
            <p className="mt-1 text-lg font-bold text-ink">{trade.exchangeCode || 'Only visible to the swap initiator'}</p>
          </div>

          {trade.selectedOfferedBookId ? (
            <div className="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-ink/80">
              Owner selected: <span className="font-semibold">{trade.selectedOfferedBookId.title}</span>
            </div>
          ) : null}

          <div className="mt-3 space-y-1 text-sm text-ink/80">
            <p>{isRequester ? 'Share this OTP with owner at meetup.' : myVerified ? 'OTP verified by owner' : 'Enter OTP to complete trade'}</p>
            <p>{isRequester ? 'Waiting for owner verification' : otherVerified ? 'Trade will complete now' : 'Verify to finish exchange'}</p>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            {!isRequester ? (
              <>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  className="w-full rounded-full border border-sand bg-white px-4 py-2 outline-none focus:border-coral"
                />
                <button
                  type="button"
                  onClick={() => onVerifyCode(trade._id, otp)}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                >
                  Verify Exchange
                </button>
              </>
            ) : null}

            {isRequester ? (
              <button
                type="button"
                onClick={() => onRegenerateCode(trade._id)}
                className="rounded-full bg-spruce px-4 py-2 text-sm font-semibold text-white"
              >
                Regenerate OTP
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isCompleted ? (
        <div className="mt-5 rounded-2xl bg-spruce/10 px-4 py-3 text-sm font-semibold text-spruce">
          Completed. Owner verified OTP from swap initiator.
        </div>
      ) : null}
    </article>
  );
}
