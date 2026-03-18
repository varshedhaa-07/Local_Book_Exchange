import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';

const fallbackImage =
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80';

export default function MyBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/profile');
        setBooks(data?.books || []);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  if (loading) {
    return <Loader text="Loading your books" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="My Books"
        description="All books you have listed for exchange."
        actions={
          <Link
            to="/profile"
            className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink"
          >
            Back to Profile
          </Link>
        }
      />

      {books.length ? (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <article key={book._id} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-soft">
              <img
                src={book.image || fallbackImage}
                alt={book.title}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-3 p-5">
                <h3 className="text-xl font-bold text-ink">{book.title}</h3>
                <p className="text-sm text-ink/70">by {book.author}</p>
                <p className="text-sm text-ink/70">Condition: <span className="font-semibold text-ink">{book.condition}</span></p>
                <p className="text-sm text-ink/70">Genre: <span className="font-semibold text-ink">{book.genre}</span></p>
                <p className="text-sm text-ink/70">Location: <span className="font-semibold text-ink">{book.location}</span></p>
                <Link
                  to={`/books/${book._id}`}
                  className="inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No books added yet"
          description="Once you add books, they will appear here."
        />
      )}
    </div>
  );
}
