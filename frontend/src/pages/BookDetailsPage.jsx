import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';

const fallbackImage =
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80';

export default function BookDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/books/${id}`);
        setBook(data);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const requestTrade = async () => {
    try {
      await api.post('/trade/request', {
        bookId: book._id,
        ownerId: book.ownerId?._id,
      });
      setMessage('Trade request sent successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to send request');
    }
  };

  if (loading) {
    return <Loader text="Loading book details" />;
  }

  return (
    <div className="space-y-8">

      {message ? <div className="rounded-2xl bg-spruce/10 px-5 py-4 text-sm font-medium text-spruce">{message}</div> : null}

      <section className="grid gap-8 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/85 p-6 shadow-soft lg:grid-cols-[1fr_0.9fr]">
        <img src={book.image || fallbackImage} alt={book.title} className="h-full min-h-[360px] w-full rounded-[2rem] object-cover" />
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-coral">{book.genre}</p>
            <h2 className="mt-3 text-4xl font-bold text-ink">{book.title}</h2>
            <p className="mt-2 text-lg text-ink/70">by {book.author}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Condition</p>
              <p className="mt-2 text-xl font-semibold text-ink">{book.condition}</p>
            </div>
            <div className="rounded-3xl bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Location</p>
              <p className="mt-2 text-xl font-semibold text-ink">{book.location}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-sand/50 bg-sand/20 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Owner</p>
            <p className="mt-2 text-xl font-semibold text-ink">{book.ownerId?.name}</p>
            <p className="text-sm text-ink/70">{book.ownerId?.email}</p>
          </div>

          {book.ownerId?._id !== user.id ? (
            <button
              type="button"
              onClick={requestTrade}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
            >
              Request this book
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
