'use client';

import { getCurrentBadge } from '@/lib/badges';

interface BadgePillProps {
  streak: number;
  locale?: string;
}

export function BadgePill({ streak, locale = 'en' }: BadgePillProps) {
  const badge = getCurrentBadge(streak);
  if (!badge) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
      style={{
        backgroundColor: badge.color + '20',
        color: badge.color,
      }}
    >
      {badge.emoji} {badge.name[locale === 'es' ? 'es' : 'en']}
    </span>
  );
}
