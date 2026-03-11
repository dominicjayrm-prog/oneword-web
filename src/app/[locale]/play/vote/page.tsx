'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useVoting } from '@/lib/hooks/useVoting';
import { WordDisplay } from '@/components/game/WordDisplay';
import { VotePair } from '@/components/game/VotePair';
import { ReportDialog } from '@/components/game/ReportDialog';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from '@/i18n/navigation';

export default function VotePage() {
  const { user, profile } = useAuth();
  const lang = profile?.language || 'en';
  const t = useTranslations('vote');
  const tGame = useTranslations('game');
  const { word, userDescription, loading: wordLoading, error: wordError, fetchUserDescription } = useWord(lang);
  const { pair, loading: voteLoading, restoring, votesCount, noMorePairs, batchExhausted, fetchPair, submitVote, VOTE_BATCH_SIZE } = useVoting(
    word?.id,
    user?.id
  );
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null);
  const [reportTarget, setReportTarget] = useState<{ descriptionId: string; wordId: string } | null>(null);

  useEffect(() => {
    if (user && word) {
      fetchUserDescription(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, word]);

  useEffect(() => {
    if (userDescription !== null) {
      setHasPlayed(true);
      // Only fetch a pair once DB restore is done (so batchExhaustedRef is set)
      if (!restoring) fetchPair();
    } else if (!wordLoading && word && user && hasPlayed === null) {
      // Delay briefly to allow fetchUserDescription to complete
      const timer = setTimeout(() => {
        setHasPlayed((current) => current === null ? false : current);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userDescription, wordLoading, word, user, hasPlayed, restoring, fetchPair]);

  if (wordLoading || restoring) {
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

  // Batch exhausted — show "great work" screen
  if (batchExhausted) {
    return (
      <div className="flex flex-col items-center text-center">
        <WordDisplay word={word.word} category={word.category} />
        <p className="mt-8 text-2xl font-bold text-text">
          {t('great_work')}
        </p>
        <p className="mt-2 text-text-muted">
          {t('voted_count', { count: votesCount })}
        </p>
        <Link href="/play/results" className="mt-4">
          <Button variant="primary" size="lg">
            {tGame('see_results')}
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

      <p className="mt-4 text-sm text-text-muted">
        {t('vote_number', { count: votesCount + 1 })} / {VOTE_BATCH_SIZE}
      </p>

      <div className="mt-8 w-full">
        {voteLoading || !pair ? (
          <LoadingSpinner />
        ) : (
          <>
            <VotePair
              key={`${pair.option_a_id}-${pair.option_b_id}`}
              optionA={{
                id: pair.option_a_id,
                description: pair.option_a_description,
                username: pair.option_a_username,
                badgeEmoji: pair.option_a_badge_emoji,
              }}
              optionB={{
                id: pair.option_b_id,
                description: pair.option_b_description,
                username: pair.option_b_username,
                badgeEmoji: pair.option_b_badge_emoji,
              }}
              onVote={submitVote}
              onReport={(descId) => setReportTarget({ descriptionId: descId, wordId: word.id })}
            />
          </>
        )}
      </div>

      {/* Report dialog */}
      {reportTarget && user && (
        <ReportDialog
          descriptionId={reportTarget.descriptionId}
          wordId={reportTarget.wordId}
          reporterId={user.id}
          onClose={() => setReportTarget(null)}
          onReported={() => {
            setReportTarget(null);
            fetchPair();
          }}
        />
      )}
    </div>
  );
}
