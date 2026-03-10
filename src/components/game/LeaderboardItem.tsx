'use client';

import { useTranslations } from 'next-intl';
import { getRankEmoji } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LeaderboardItemProps {
  rank: number;
  description: string;
  username: string;
  voteCount: number;
  isCurrentUser?: boolean;
}

export function LeaderboardItem({
  rank,
  description,
  username,
  voteCount,
  isCurrentUser,
}: LeaderboardItemProps) {
  const t = useTranslations('results');
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border px-5 py-4',
        rank === 1
          ? 'border-gold/30 bg-gold/5'
          : rank === 2
          ? 'border-silver/30 bg-silver/5'
          : rank === 3
          ? 'border-bronze/30 bg-bronze/5'
          : 'border-border bg-white',
        isCurrentUser && 'ring-2 ring-primary/30'
      )}
    >
      <span className="text-xl font-bold shrink-0 w-10 text-center">
        {getRankEmoji(rank)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-base text-text truncate">
          &ldquo;{description}&rdquo;
        </p>
        <p className="text-sm text-text-muted">
          @{username}
          {isCurrentUser && (
            <span className="ml-2 text-xs font-bold text-primary">{t('you_label')}</span>
          )}
        </p>
      </div>
      <span className="font-mono text-xs text-text-muted shrink-0">{voteCount}v</span>
    </div>
  );
}
