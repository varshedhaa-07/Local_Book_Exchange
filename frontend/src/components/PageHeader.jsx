export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-coral">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
