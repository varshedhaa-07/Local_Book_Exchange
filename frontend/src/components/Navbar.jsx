import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';

const links = [
  { to: '/', label: 'Browse' },
  { to: '/add-book', label: 'Add Book' },
  { to: '/trade-requests', label: 'Requests' },
  { to: '/matches', label: 'Matches' },
  { to: '/chat', label: 'Chat' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        const { data } = await api.get('/notifications?limit=10');
        if (!mounted) {
          return;
        }
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        if (mounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Keep the UI unchanged on request failure.
    }
  };

  const markOneRead = async (notificationId) => {
    try {
      const { data } = await api.put(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Keep the UI unchanged on request failure.
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-mist/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <NavLink to="/" className="flex items-center gap-3">
          <div>
            <p className="text-lg font-bold text-ink">Local Book Exchange</p>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Swap locally, read widely</p>
          </div>
        </NavLink>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-ink text-white' : 'text-ink hover:bg-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="relative rounded-full bg-white p-2.5 text-ink transition hover:bg-mist"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M9 17a3 3 0 0 0 6 0" />
              </svg>
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-coral px-1.5 text-center text-[10px] font-bold leading-5 text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </button>

            {open ? (
              <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-white/70 bg-white p-3 shadow-soft">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-sm font-semibold text-ink">Recent updates</p>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-coral"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 space-y-2 overflow-auto pr-1">
                  {notifications.length ? (
                    notifications.map((item) => (
                      <Link
                        key={item._id}
                        to={item.link || '/trade-requests'}
                        onClick={() => {
                          markOneRead(item._id);
                          setOpen(false);
                        }}
                        className={`block rounded-xl px-3 py-2 transition ${
                          item.isRead ? 'bg-mist text-ink/70' : 'bg-coral/10 text-ink'
                        }`}
                      >
                        <p className="text-sm font-medium">{item.message}</p>
                        <p className="mt-1 text-xs text-ink/50">{formatDate(item.createdAt)}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-sm text-ink/60">No notifications yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-ink/50">{user?.location}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

