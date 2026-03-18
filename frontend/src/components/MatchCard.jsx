export default function MatchCard({ match, currentUserId }) {
  const otherUser = match.userA?._id === currentUserId ? match.userB : match.userA;
  const isInProgress = match.status === 'In Progress';

  return (
    <article className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-coral">
            {isInProgress ? 'Accepted Exchange' : 'Trade suggestion'}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-ink">
            {isInProgress ? `Active exchange with ${otherUser?.name}` : `Potential match with ${otherUser?.name}`}
          </h3>
          <p className="mt-1 text-sm text-ink/70">{otherUser?.location}</p>
        </div>
        <p className="rounded-full bg-spruce/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-spruce">
          {isInProgress ? 'In Progress' : `${match.matchedBooks?.length || 0} reciprocal options`}
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {match.matchedBooks?.map((pair, index) => (
          <div key={`${pair.requestedBook?._id}-${pair.offeredBook?._id}-${index}`} className="grid gap-4 rounded-3xl bg-mist p-5 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink/45">
                {isInProgress ? 'Requested book' : 'You want'}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-ink">{pair.requestedBook?.title}</h4>
              <p className="text-sm text-ink/70">{pair.requestedBook?.author}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink/45">
                {isInProgress ? 'Selected swap book' : 'They want'}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-ink">{pair.offeredBook?.title}</h4>
              <p className="text-sm text-ink/70">{pair.offeredBook?.author}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
