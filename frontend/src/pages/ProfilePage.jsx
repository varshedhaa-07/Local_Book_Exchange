import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader';

const profileLinks = [
  { to: '/profile/books', label: 'My Books' },
  { to: '/profile/trades', label: 'My Trades' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/profile');
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <Loader text="Loading your profile" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3 rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-soft h-fit">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-coral">Profile Menu</p>
        {profileLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="block rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">My Details</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/50">Name</p>
            <p className="mt-2 text-lg font-bold text-ink">{profile?.user?.name || '-'}</p>
          </div>
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/50">Email</p>
            <p className="mt-2 text-lg font-bold text-ink break-all">{profile?.user?.email || '-'}</p>
          </div>
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/50">Location</p>
            <p className="mt-2 text-lg font-bold text-ink">{profile?.user?.location || '-'}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/profile/books"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
          >
            Open My Books
          </Link>
          <Link
            to="/profile/trades"
            className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Open My Trades
          </Link>
        </div>
      </section>
    </div>
  );
}
