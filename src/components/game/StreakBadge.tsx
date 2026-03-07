'use client';

import { useTranslations } from 'next-intl';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const t = useTranslations('game');
  if (streak === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
      &#128293; {t('day_streak', { count: streak })}
    </span>
  );
}
