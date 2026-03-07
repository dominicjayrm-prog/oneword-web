'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useFriends } from '@/lib/hooks/useFriends';
import { WordDisplay } from '@/components/game/WordDisplay';
import { LeaderboardItem } from '@/components/game/LeaderboardItem';
import { ShareCard } from '@/components/game/ShareCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

type Tab = 'global' | 'friends';

export default function ResultsPage() {
  const { user, profile } = useAuth();
  const { word, userDescription, loading: wordLoading, fetchUserDescription } = useWord(
    profile?.language || 'en'
  );
  const { entries, loading: lbLoading, fetchLeaderboard } = useLeaderboard(word?.id);
  const { friendsDescriptions, fetchFriendsDescriptions } = useFriends(user?.id);
  const [tab, setTab] = useState<Tab>('global');

  useEffect(() => {
    if (user && word) {
      fetchUserDescription(user.id);
      fetchLeaderboard(100);
      fetchFriendsDescriptions(word.id);
    }
  }, [user, word]);

  if (wordLoading || !word) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userEntry = entries.find((e) => e.user_id === user?.id);
  const userRank = userEntry
    ? entries.indexOf(userEntry) + 1
    : null;

  return (
    <div className="flex flex-col items-center">
      <WordDisplay word={word.word} category={word.category} />

      {/* Share card */}
      {userDescription && userRank && (
        <div className="mt-6 w-full">
          <ShareCard
            word={word.word}
            description={userDescription.description}
            rank={userRank}
            totalPlayers={entries.length}
          />
        </div>
      )}

      {/* Tab toggle */}
      <div className="mt-8 flex w-full rounded-xl bg-surface p-1">
        {(['global', 'friends'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all cursor-pointer',
              tab === t ? 'bg-white text-text shadow-sm' : 'text-text-muted'
            )}
          >
            {t === 'global' ? '\uD83C\uDF0D Global' : '\uD83D\uDC65 Friends'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="mt-6 flex w-full flex-col gap-2">
        {lbLoading ? (
          <LoadingSpinner />
        ) : tab === 'global' ? (
          entries.length > 0 ? (
            entries.map((entry, i) => (
              <LeaderboardItem
                key={entry.id || i}
                rank={i + 1}
                description={entry.description}
                username={entry.username}
                voteCount={entry.vote_count}
                isCurrentUser={entry.user_id === user?.id}
              />
            ))
          ) : (
            <p className="py-8 text-center text-text-muted">No results yet. Check back later!</p>
          )
        ) : friendsDescriptions.length > 0 ? (
          friendsDescriptions.map((entry, i) => (
            <LeaderboardItem
              key={entry.user_id || i}
              rank={i + 1}
              description={entry.description}
              username={entry.username}
              voteCount={entry.vote_count}
              isCurrentUser={entry.user_id === user?.id}
            />
          ))
        ) : (
          <p className="py-8 text-center text-text-muted">
            No friends&apos; results yet.
          </p>
        )}
      </div>
    </div>
  );
}
