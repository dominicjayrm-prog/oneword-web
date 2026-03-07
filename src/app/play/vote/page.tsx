'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useVoting } from '@/lib/hooks/useVoting';
import { WordDisplay } from '@/components/game/WordDisplay';
import { VotePair } from '@/components/game/VotePair';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getTranslations } from '@/lib/i18n';

export default function VotePage() {
  const { user, profile } = useAuth();
  const lang = profile?.language || 'en';
  const t = getTranslations(lang);
  const { word, userDescription, loading: wordLoading, fetchUserDescription } = useWord(lang);
  const { pair, loading: voteLoading, votesCount, noMorePairs, fetchPair, submitVote } = useVoting(
    word?.id,
    user?.id
  );
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null);

  useEffect(() => {
    if (user && word) {
      fetchUserDescription(user.id).then(() => {
        // After fetch, check
      });
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
        <WordDisplay word={word.word} category={word.category} language={lang} />
        <p className="mt-8 text-lg text-text-muted">{t.playFirst}</p>
        <Button variant="primary" size="lg" as="a" href="/play" className="mt-4">
          {t.playNow}
        </Button>
      </div>
    );
  }

  if (noMorePairs) {
    return (
      <div className="flex flex-col items-center text-center">
        <WordDisplay word={word.word} category={word.category} language={lang} />
        {votesCount > 0 ? (
          <>
            <p className="mt-8 text-2xl font-bold text-text">
              {t.allDone(votesCount)}
            </p>
            <Button variant="primary" size="lg" as="a" href="/play/results" className="mt-4">
              {t.seeResults}
            </Button>
          </>
        ) : (
          <p className="mt-8 text-lg text-text-muted">
            {t.notEnoughDescs}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <WordDisplay word={word.word} category={word.category} language={lang} />

      {votesCount > 0 && (
        <p className="mt-4 text-sm text-text-muted">
          {t.voteNumber(votesCount + 1)}
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
            language={lang}
          />
        )}
      </div>
    </div>
  );
}
