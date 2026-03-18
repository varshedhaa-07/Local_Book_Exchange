import { useEffect, useState } from 'react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import TradeRequestCard from '../components/TradeRequestCard';
import { useAuth } from '../hooks/useAuth';

export default function TradeRequestsPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadTrades = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/trade/user');
      setTrades(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const respondToTrade = async (requestId, action, selectedOfferedBookId = null) => {
    try {
      const payload = { requestId, action };

      if (selectedOfferedBookId) {
        payload.selectedOfferedBookId = selectedOfferedBookId;
      }

      const { data } = await api.put('/trade/respond', payload);

      if (data.exchangeCode) {
        setMessage(`Trade moved to ${data.status}. Exchange OTP: ${data.exchangeCode}`);
      } else {
        setMessage(`Trade request is now ${data.status}`);
      }

      await loadTrades();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update trade right now');
    }
  };

  const verifyExchangeCode = async (requestId, code) => {
    try {
      const { data } = await api.put('/trade/exchange/verify', { requestId, code });
      setMessage(data.message || 'Owner verification updated');
      await loadTrades();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to verify OTP');
    }
  };

  const regenerateExchangeCode = async (requestId) => {
    try {
      const { data } = await api.post('/trade/exchange/regenerate', { requestId });
      setMessage(`New OTP generated: ${data.exchangeCode}`);
      await loadTrades();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to regenerate OTP');
    }
  };

  return (
    <div className="space-y-8">
      {message ? <div className="rounded-2xl bg-spruce/10 px-5 py-4 text-sm font-medium text-spruce">{message}</div> : null}

      {loading ? (
        <Loader text="Loading trade requests" />
      ) : trades.length ? (
        <section className="grid gap-6">
          {trades.map((trade) => (
            <TradeRequestCard
              key={trade._id}
              trade={trade}
              currentUserId={user.id}
              onRespond={respondToTrade}
              onVerifyCode={verifyExchangeCode}
              onRegenerateCode={regenerateExchangeCode}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No trade activity yet"
          description="Once you request a book or receive a request, the approval workflow will appear here."
        />
      )}
    </div>
  );
}
