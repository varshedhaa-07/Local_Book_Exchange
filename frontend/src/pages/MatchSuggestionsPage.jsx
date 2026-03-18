import { useEffect, useState } from 'react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import MatchCard from '../components/MatchCard';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';

function normalizeMatches(rawMatches = []) {
  const seenMatches = new Set();

  return rawMatches
    .filter((match) => {
      const matchId = match?._id || `${match?.userA?._id}-${match?.userB?._id}`;

      if (!matchId || seenMatches.has(matchId)) {
        return false;
      }

      seenMatches.add(matchId);
      return true;
    })
    .map((match) => {
      const seenPairs = new Set();
      const matchedBooks = (match?.matchedBooks || []).filter((pair) => {
        const requestedId = pair?.requestedBook?._id || pair?.requestedBook?.title || 'unknown-requested';
        const offeredId = pair?.offeredBook?._id || pair?.offeredBook?.title || 'unknown-offered';
        const pairKey = `${requestedId}-${offeredId}`;

        if (seenPairs.has(pairKey)) {
          return false;
        }

        seenPairs.add(pairKey);
        return true;
      });

      return { ...match, matchedBooks };
    });
}

export default function MatchSuggestionsPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/matches');
        setMatches(normalizeMatches(data));
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  return (
    <div className="space-y-8">

      {loading ? (
        <Loader text="Finding your best swap opportunities" />
      ) : matches.length ? (
        <section className="grid gap-6">
          {matches.map((match) => {
            const matchKey = match._id || `${match?.userA?._id}-${match?.userB?._id}`;

            return <MatchCard key={matchKey} match={match} currentUserId={user.id} />;
          })}
        </section>
      ) : (
        <EmptyState
          title="No reciprocal matches yet"
          description="Keep browsing and requesting books. Matches will appear once another reader also wants one of your books."
        />
      )}
    </div>
  );
}
