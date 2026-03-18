import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const authPanelBackground = "data:image/jpeg;base64,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";

export default function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      const nextError =
        err.response?.data?.message ||
        (err.request
          ? 'Cannot reach the backend. Make sure the API server is running on http://localhost:5000.'
          : 'Authentication failed');

      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundImage: `url(${authPanelBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white/50 bg-white/90 p-6 shadow-soft backdrop-blur md:p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-ink md:text-4xl">Local Book Exchange Platform</h1>

        <div className="flex justify-center gap-3">
          {['login', 'signup'].map((currentMode) => (
            <button
              key={currentMode}
              type="button"
              onClick={() => setMode(currentMode)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === currentMode ? 'bg-ink text-white' : 'bg-mist text-ink'
              }`}
            >
              {currentMode === 'login' ? 'Login' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {mode === 'signup' ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Name</span>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
          </label>

          {mode === 'signup' ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Location</span>
              <input name="location" value={form.location} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
            </label>
          ) : null}

          {error ? <div className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-coral">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to your account' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}



