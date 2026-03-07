'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useVoting } from '@/lib/hooks/useVoting';
import { WordDisplay } from '@/components/game/WordDisplay';
import { VotePair } from '@/components/game/VotePair';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function VotePage() {
  const { user, profile } = useAuth();
  const locale = useLocale();
  const lang = profile?.language || locale;
  const t = useTranslations('vote');
  const tGame = useTranslations('game');
  const { word, userDescription, loading: wordLoading, fetchUserDescription } = useWord(lang);
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
    } else if (!wordLoading && word) {
      setHasPlayed(!!userDescription);
    }
  }, [userDescription, wordLoading, word]);

  if (wordLoading || !word) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasPlayed === false) {
    return (
      <div className="flex flex-col items-center text-center">
        <WordDisplay word={word.word} category={word.category} />
        <p className="mt-8 text-lg text-text-muted">{t('play_first')}</p>
        <Button variant="primary" size="lg" as="a" href={`/${locale}/play`} className="mt-4">
          {t('play_now')}
        </Button>
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
            <Button variant="primary" size="lg" as="a" href={`/${locale}/play/results`} className="mt-4">
              {tGame('see_results')}
            </Button>
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
