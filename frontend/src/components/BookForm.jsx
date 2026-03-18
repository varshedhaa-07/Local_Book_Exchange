import { useState } from 'react';

const buildInitialState = (defaultValues = {}) => ({
  title: defaultValues.title || '',
  author: defaultValues.author || '',
  genre: defaultValues.genre || '',
  condition: defaultValues.condition || '',
  image: defaultValues.image || '',
  location: defaultValues.location || '',
});

export default function BookForm({ defaultValues, onSubmit, loading, submitLabel }) {
  const [form, setForm] = useState(() => buildInitialState(defaultValues));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form, () => setForm(buildInitialState()));
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-soft">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Title</span>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Author</span>
          <input name="author" value={form.author} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Genre</span>
          <input name="genre" value={form.genre} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Condition</span>
          <select name="condition" value={form.condition} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral">
            <option value="">Select condition</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Used">Used</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Image URL</span>
          <input name="image" value={form.image} onChange={handleChange} className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Location</span>
          <input name="location" value={form.location} onChange={handleChange} required className="w-full rounded-2xl border border-sand bg-mist px-4 py-3 outline-none transition focus:border-coral" />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
