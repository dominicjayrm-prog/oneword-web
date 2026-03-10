'use client';

import { useTranslations } from 'next-intl';
import { getCurrentBadge, getNextBadge, getProgressToNext } from '@/lib/badges';

interface BadgeProgressProps {
  streak: number;
  locale?: string;
}

export function BadgeProgress({ streak, locale = 'en' }: BadgeProgressProps) {
  const t = useTranslations('profile');
  const current = getCurrentBadge(streak);
  const next = getNextBadge(streak);
  const progress = getProgressToNext(streak);

  if (!current && !next) return null;

  if (!next) {
    return (
      <div className="text-center">
        <p className="text-sm text-text-muted">
          {current?.emoji} {current?.name[locale === 'es' ? 'es' : 'en']} — {t('highest_tier')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{current ? `${current.emoji} ${current.streak}` : '0'}</span>
        <span>{next.emoji} {next.streak}</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-surface">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: next.color,
          }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-text-muted">
        {streak} / {next.streak} — {next.name[locale === 'es' ? 'es' : 'en']}
      </p>
    </div>
  );
}
