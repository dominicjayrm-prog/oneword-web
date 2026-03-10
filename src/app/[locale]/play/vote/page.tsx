'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useVoting } from '@/lib/hooks/useVoting';
import { WordDisplay } from '@/components/game/WordDisplay';
import { VotePair } from '@/components/game/VotePair';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from '@/i18n/navigation';

export default function VotePage() {
  const { user, profile } = useAuth();
  const lang = profile?.language || 'en';
  const t = useTranslations('vote');
  const tGame = useTranslations('game');
  const { word, userDescription, loading: wordLoading, error: wordError, fetchUserDescription } = useWord(lang);
  const { pair, loading: voteLoading, votesCount, noMorePairs, fetchPair, submitVote } = useVoting(
    word?.id,
    user?.id
  );
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null);

  useEffect(() => {
    if (user && word) {
      fetchUserDescription(user.id);
    }
  }, [user, word]);

  useEffect(() => {
    if (userDescription !== null) {
      setHasPlayed(true);
      fetchPair();
    } else if (!wordLoading && word && user) {
      // Only set hasPlayed=false after we've had time to fetch the description
      // fetchUserDescription is triggered in the effect above; wait for it to resolve
      // If userDescription is still null after word+user are ready, a brief delay
      // ensures the fetch has completed before showing "play first"
      const timer = setTimeout(() => {
        if (!userDescription) setHasPlayed(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userDescription, wordLoading, word, user]);

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

  if (hasPlayed === false) {
    return (
      <div className="flex flex-col items-center text-center">
        <WordDisplay word={word.word} category={word.category} />
        <p className="mt-8 text-lg text-text-muted">{t('play_first')}</p>
        <Link href="/play" className="mt-4">
          <Button variant="primary" size="lg">
            {t('play_now')}
          </Button>
        </Link>
      </div>
    );
  }

  if (noMorePairs) {
    return (
      <div className="flex flex-col items-center text-center">
        <WordDisplay word={word.word} category={word.category} />
        {votesCount > 0 ? (
          <>
            <p className="mt-8 text-2xl font-bold text-text">
              {t('all_done', { count: votesCount })}
            </p>
            <Link href="/play/results" className="mt-4">
              <Button variant="primary" size="lg">
                {tGame('see_results')}
              </Button>
            </Link>
          </>
        ) : (
          <p className="mt-8 text-lg text-text-muted">
            {t('not_enough')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <WordDisplay word={word.word} category={word.category} />

      {votesCount > 0 && (
        <p className="mt-4 text-sm text-text-muted">
          {t('vote_number', { count: votesCount + 1 })}
        </p>
      )}

      <div className="mt-8 w-full">
        {voteLoading || !pair ? (
          <LoadingSpinner />
        ) : (
          <VotePair
            key={`${pair.option_a_id}-${pair.option_b_id}`}
            optionA={{ id: pair.option_a_id, description: pair.option_a_description }}
            optionB={{ id: pair.option_b_id, description: pair.option_b_description }}
            onVote={submitVote}
          />
        )}
      </div>
    </div>
  );
}
