import { Link } from 'react-router-dom';

const fallbackImage =
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80';

export default function BookCard({ book, currentUserId, onRequest, onDelete, onEdit }) {
  const isOwner = book.ownerId?._id === currentUserId || book.ownerId === currentUserId;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-soft transition duration-300 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <img
          src={book.image || fallbackImage}
          alt={book.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
          {book.genre}
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-2xl font-bold text-ink">{book.title}</h3>
          <p className="mt-1 text-sm text-ink/70">by {book.author}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-ink/70">
          <div className="rounded-2xl bg-mist px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Condition</p>
            <p className="mt-1 font-semibold text-ink">{book.condition}</p>
          </div>
          <div className="rounded-2xl bg-mist px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Location</p>
            <p className="mt-1 font-semibold text-ink">{book.location}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-sand/50 bg-sand/20 px-4 py-3 text-sm text-ink/70">
          Owner: <span className="font-semibold text-ink">{book.ownerId?.name || 'Unknown user'}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/books/${book._id}`}
            className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            View details
          </Link>

          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(book)}
                className="rounded-full bg-spruce px-4 py-2 text-sm font-semibold text-white transition hover:bg-spruce/90"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(book._id)}
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onRequest?.(book)}
              className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90"
            >
              Request trade
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
