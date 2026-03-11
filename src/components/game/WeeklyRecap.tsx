'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getCurrentBadge } from '@/lib/badges';
import { Button } from '@/components/ui/Button';

export interface WeeklyRecapData {
  days_played: number;
  total_votes_received: number;
  best_rank: number | null;
  best_rank_word: string | null;
  best_rank_description: string | null;
  best_rank_total_players: number | null;
  average_rank: number | null;
  previous_week_average_rank: number | null;
  current_streak: number;
  total_descriptions_submitted: number;
  perfect_week: boolean;
  week_start: string;
  week_end: string;
}

interface WeeklyRecapProps {
  data: WeeklyRecapData;
  onDismiss: () => void;
  onShare: () => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeeklyRecap({ data, onDismiss, onShare }: WeeklyRecapProps) {
  const t = useTranslations('weekly');
  const badge = getCurrentBadge(data.current_streak);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);
  const improved = data.average_rank != null && data.previous_week_average_rank != null
    && data.average_rank < data.previous_week_average_rank;

  const formatDate = (d: string) => {
    const date = new Date(d + 'T12:00:00Z');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'linear-gradient(to bottom, #1A1A2E, #2D1B69)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="weekly-recap-title"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md py-8 text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
          {t('title')}
        </p>
        <h1 id="weekly-recap-title" className="mt-2 font-serif text-3xl font-black text-white">
          {formatDate(data.week_start)} — {formatDate(data.week_end)}
        </h1>

        {data.perfect_week && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-sm font-bold text-gold"
          >
            🌟 {t('perfect_week')}
          </motion.div>
        )}

        {/* Best of the week */}
        {data.best_rank_word && data.best_rank_description && (
          <div className="mt-8 rounded-2xl bg-white/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              {t('best_of_week')}
            </p>
            <h3 className="mt-2 font-serif text-2xl font-black text-white">
              {data.best_rank_word.toUpperCase()}
            </h3>
            <p className="mt-2 font-serif text-lg italic text-white/80">
              &ldquo;{data.best_rank_description}&rdquo;
            </p>
            <p className="mt-2 text-sm text-white/60">
              #{data.best_rank} {t('of')} {data.best_rank_total_players}
            </p>
          </div>
        )}

        {/* Day circles */}
        <div className="mt-8 flex justify-center gap-3">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  i < data.days_played
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                {i < data.days_played ? '✓' : ''}
              </div>
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="font-mono text-2xl font-bold text-white">{data.days_played}/7</p>
            <p className="text-xs text-white/50">{t('days_played')}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="font-mono text-2xl font-bold text-white">{data.total_votes_received}</p>
            <p className="text-xs text-white/50">{t('votes_received')}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="font-mono text-2xl font-bold text-white">
              {data.current_streak} {badge?.emoji || '🔥'}
            </p>
            <p className="text-xs text-white/50">{t('streak')}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="font-mono text-2xl font-bold text-white">
              {data.average_rank != null ? `#${Math.round(data.average_rank)}` : '—'}
              {improved && <span className="ml-1 text-sm text-green-400">↑</span>}
            </p>
            <p className="text-xs text-white/50">{t('avg_rank')}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button variant="primary" className="w-full" onClick={onShare}>
            {t('share_week')}
          </Button>
          <button
            onClick={onDismiss}
            className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            {t('continue')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
