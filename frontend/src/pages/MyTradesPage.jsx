import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';

export default function MyTradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrades = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/profile');
        setTrades(data?.trades || []);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  const completedTrades = useMemo(
    () => trades.filter((trade) => trade.status === 'Completed'),
    [trades],
  );

  if (loading) {
    return <Loader text="Loading your completed trades" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="My Trades"
        description="Completed exchanges done by you."
        actions={
          <Link
            to="/profile"
            className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink"
          >
            Back to Profile
          </Link>
        }
      />

      {completedTrades.length ? (
        <section className="grid gap-4">
          {completedTrades.map((trade) => {
            const isRequester = trade.requesterId?._id === user?.id;
            const partner = isRequester ? trade.ownerId : trade.requesterId;

            return (
              <article key={trade._id} className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-spruce">Completed</p>
                <h3 className="mt-2 text-xl font-bold text-ink">
                  Requested book: {trade.bookId?.title || 'N/A'}
                </h3>
                <p className="mt-2 text-sm text-ink/70">
                  Swapped with: {trade.selectedOfferedBookId?.title || 'N/A'}
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Trade partner: {partner?.name || 'N/A'} ({partner?.location || 'N/A'})
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Completed on {formatDate(trade.updatedAt)}
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="No completed trades yet"
          description="Your successful exchanges will be listed here once completed."
        />
      )}
    </div>
  );
}
