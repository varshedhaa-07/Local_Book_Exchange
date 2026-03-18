import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    location: '',
    nearby: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();

        if (filters.genre) {
          query.append('genre', filters.genre);
        }
        if (filters.location) {
          query.append('location', filters.location);
        }
        if (filters.nearby) {
          query.append('nearby', 'true');
        }

        const { data } = await api.get(`/books?${query.toString()}`);
        setBooks(data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters.genre, filters.location, filters.nearby]);

  const requestTrade = async (book) => {
    try {
      await api.post('/trade/request', {
        bookId: book._id,
        ownerId: book.ownerId?._id,
      });
      setActionMessage(`Trade request sent for "${book.title}"`);
      navigate('/trade-requests');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to send trade request');
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-soft md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Genre</span>
          <input
            value={filters.genre}
            onChange={(event) => setFilters((current) => ({ ...current, genre: event.target.value }))}
            className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none focus:border-coral"
            placeholder="Fantasy, Fiction..."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Location</span>
          <input
            value={filters.location}
            onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
            className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none focus:border-coral"
            placeholder={user?.location || 'Search location'}
          />
        </label>
        <label className="flex items-end">
          <button
            type="button"
            onClick={() => setFilters((current) => ({ ...current, nearby: !current.nearby }))}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              filters.nearby ? 'bg-spruce text-white' : 'bg-mist text-ink'
            }`}
          >
            {filters.nearby ? 'Nearby only enabled' : 'Show all areas'}
          </button>
        </label>
        <label className="flex items-end">
          <button
            type="button"
            onClick={() => setFilters({ genre: '', location: '', nearby: true })}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            Reset filters
          </button>
        </label>
      </section>

      {actionMessage ? <div className="rounded-2xl bg-spruce/10 px-5 py-4 text-sm font-medium text-spruce">{actionMessage}</div> : null}
      {error ? <div className="rounded-2xl bg-coral/10 px-5 py-4 text-sm font-medium text-coral">{error}</div> : null}

      {loading ? (
        <Loader text="Loading local listings" />
      ) : books.length ? (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book._id} book={book} currentUserId={user?.id} onRequest={requestTrade} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No books matched your filters"
          description="Try widening the location search or turning off nearby-only mode to see more exchange opportunities."
        />
      )}
    </div>
  );
}
