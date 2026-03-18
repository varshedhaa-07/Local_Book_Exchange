export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="rounded-full border-4 border-sand/40 border-t-coral p-5 shadow-soft">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-spruce" />
      </div>
      <span className="ml-4 text-sm font-semibold uppercase tracking-[0.25em] text-ink/70">
        {text}
      </span>
    </div>
  );
}
