'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getRankEmoji } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface YesterdayWinnerData {
  word: string;
  word_category: string;
  winner_description: string;
  winner_username: string;
  winner_votes: number;
  user_description: string | null;
  user_rank: number | null;
  total_descriptions: number;
  user_was_winner: boolean;
}

interface YesterdayWinnerProps {
  data: YesterdayWinnerData;
  onDismiss: () => void;
}

export function YesterdayWinner({ data, onDismiss }: YesterdayWinnerProps) {
  const t = useTranslations('yesterday');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`w-full max-w-md rounded-3xl p-8 text-center ${
          data.user_was_winner
            ? 'border-2 border-gold/50 bg-gradient-to-b from-gold/10 to-white'
            : 'bg-white'
        }`}
      >
        {data.user_was_winner ? (
          <div className="mb-4 text-4xl">🏆</div>
        ) : null}

        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          {data.user_was_winner ? t('you_won') : t('yesterdays_winner')}
        </p>

        <h2 className="mt-3 font-serif text-3xl font-black text-text">
          {data.word?.toUpperCase()}
        </h2>
        {data.word_category && (
          <span className="mt-1 inline-block text-xs text-text-muted">{data.word_category}</span>
        )}

        <div className="mt-6 rounded-2xl bg-surface p-5">
          <p className="font-serif text-xl italic text-text">
            &ldquo;{data.winner_description}&rdquo;
          </p>
          <p className="mt-2 text-sm text-text-muted">
            @{data.winner_username} &middot; {data.winner_votes} {t('votes')}
          </p>
        </div>

        {!data.user_was_winner && data.user_description && data.user_rank && (
          <div className="mt-4 rounded-xl border border-border p-4">
            <p className="text-sm text-text-muted">{t('your_result')}</p>
            <p className="mt-1 font-serif italic text-text">
              &ldquo;{data.user_description}&rdquo;
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-primary">
              {getRankEmoji(data.user_rank)} {t('out_of', { total: data.total_descriptions })}
            </p>
          </div>
        )}

        {!data.user_was_winner && !data.user_description && (
          <p className="mt-4 text-sm text-text-muted">{t('didnt_play')}</p>
        )}

        <Button variant="primary" className="mt-6 w-full" onClick={onDismiss}>
          {t('see_today')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
