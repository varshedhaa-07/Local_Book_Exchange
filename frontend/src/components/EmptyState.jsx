export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-8 text-center shadow-soft backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-coral">Nothing here yet</p>
      <h3 className="mt-3 text-2xl font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/70">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
