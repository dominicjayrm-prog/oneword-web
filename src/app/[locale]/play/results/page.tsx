'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useFriends } from '@/lib/hooks/useFriends';
import { WordDisplay } from '@/components/game/WordDisplay';
import { LeaderboardItem } from '@/components/game/LeaderboardItem';
import { ShareCard } from '@/components/game/ShareCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const LEADERBOARD_LIMIT = 20;

type Tab = 'global' | 'friends';

export default function ResultsPage() {
  const { user, profile } = useAuth();
  const locale = useLocale();
  const lang = profile?.language || locale;
  const t = useTranslations('results');
  const tGame = useTranslations('game');
  const { word, userDescription, loading: wordLoading, error: wordError, fetchUserDescription } = useWord(lang);
  const { entries, loading: lbLoading, fetchLeaderboard } = useLeaderboard(word?.id);
  const { friends, friendsDescriptions, fetchFriends, fetchFriendsDescriptions } = useFriends(user?.id);
  const [tab, setTab] = useState<Tab>('global');
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null);
  const [descriptionChecked, setDescriptionChecked] = useState(false);

  useEffect(() => {
    if (user && word) {
      setDescriptionChecked(false);
      fetchUserDescription(user.id).then(() => setDescriptionChecked(true));
      fetchLeaderboard(LEADERBOARD_LIMIT);
      fetchFriends().then(() => fetchFriendsDescriptions(word.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, word, fetchLeaderboard, fetchFriends, fetchFriendsDescriptions]);

  useEffect(() => {
    if (userDescription !== null) {
      setHasPlayed(true);
    } else if (descriptionChecked) {
      setHasPlayed(false);
    }
  }, [userDescription, descriptionChecked]);

  if (wordLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (wordError || !word) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-serif text-2xl text-text">{wordError || tGame('no_word')}</p>
        <p className="text-text-muted">{tGame('check_back')}</p>
      </div>
    );
  }

  // Locked state — must play first
  if (hasPlayed === false) {
    return (
      <div className="flex flex-col items-center text-center">
        <WordDisplay word={word.word} category={word.category} />
        <p className="mt-8 text-lg text-text-muted">{t('play_first')}</p>
        <Link href="/play" className="mt-4">
          <Button variant="primary" size="lg">{t('play_now')}</Button>
        </Link>
      </div>
    );
  }

  const userEntry = entries.find((e) => e.user_id === user?.id);
  const userRank = userEntry ? entries.indexOf(userEntry) + 1 : null;

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
            streak={profile?.current_streak}
            votes={userEntry?.vote_count}
          />
        </div>
      )}

      {/* Tab toggle */}
      <div className="mt-8 flex w-full rounded-xl bg-surface p-1">
        {(['global', 'friends'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all cursor-pointer',
              tab === tabKey ? 'bg-white text-text shadow-sm' : 'text-text-muted'
            )}
          >
            {tabKey === 'global' ? t('global') : t('friends')}
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
                badgeEmoji={(entry as unknown as Record<string, unknown>).streak_badge_emoji as string | undefined}
              />
            ))
          ) : (
            <p className="py-8 text-center text-text-muted">{t('no_results')}</p>
          )
        ) : friendsDescriptions.length > 0 ? (
          [...friendsDescriptions].sort((a, b) => b.vote_count - a.vote_count).map((entry, i) => (
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
            {t('no_friends_results')}
          </p>
        )}
      </div>
    </div>
  );
}
