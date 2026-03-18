import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import heroImage from '../assets/WhatsApp Image 2026-03-17 at 16.08.30.jpeg';
import ChatSidebar from '../components/ChatSidebar';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

export default function ChatPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEligibleContacts = async () => {
      try {
        const { data } = await api.get('/trade/user');
        const contacts = [];
        const seen = new Set();

        data
          .filter((trade) => ['In Progress', 'Completed'].includes(trade.status))
          .forEach((trade) => {
            const otherUser = trade.requesterId?._id === user.id ? trade.ownerId : trade.requesterId;

            if (otherUser && !seen.has(otherUser._id)) {
              seen.add(otherUser._id);
              contacts.push(otherUser);
            }
          });

        setConversations(contacts);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load conversations');
      }
    };

    loadEligibleContacts();
  }, [user.id]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return undefined;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/chat/${userId}`);
        setMessages(data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      await api.post('/chat/send', { receiverId: userId, message });
      setMessage('');
      const { data } = await api.get(`/chat/${userId}`);
      setMessages(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send message');
    }
  };

  return (
    <div className="space-y-8">
      {error ? <div className="rounded-2xl bg-coral/10 px-5 py-4 text-sm font-medium text-coral">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ChatSidebar conversations={conversations} activeUserId={userId} />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white/90" />

          <div className="relative z-10">
            {!userId ? (
              <EmptyState
                title="Pick a conversation"
                description="Select one of your approved trade partners from the left to start coordinating the handoff."
              />
            ) : loading ? (
              <Loader text="Loading conversation" />
            ) : (
              <>
                <div className="space-y-4">
                  {messages.length ? (
                    messages.map((item) => {
                      const mine = item.senderId?._id === user.id;
                      return (
                        <div key={item._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xl rounded-3xl px-5 py-4 ${
                              mine ? 'bg-ink text-white' : 'bg-mist text-ink'
                            }`}
                          >
                            <p className="text-sm leading-7">{item.message}</p>
                            <p className={`mt-2 text-xs ${mine ? 'text-white/70' : 'text-ink/50'}`}>
                              {formatDate(item.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState
                      title="No messages yet"
                      description="Send the first message to lock in a meetup time and place for the exchange."
                    />
                  )}
                </div>

                <form onSubmit={sendMessage} className="mt-6 flex gap-3">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 rounded-full border border-sand bg-mist px-5 py-3 outline-none focus:border-coral"
                  />
                  <button type="submit" className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
