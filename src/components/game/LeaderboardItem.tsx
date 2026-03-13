'use client';

import { useTranslations } from 'next-intl';
import { getRankEmoji, formatDescription } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { FavouriteButton } from '@/components/game/FavouriteButton';

interface LeaderboardItemProps {
  rank: number;
  description: string;
  username: string;
  voteCount: number;
  isCurrentUser?: boolean;
  badgeEmoji?: string;
  descriptionId?: string;
  isFavourited?: boolean;
  onToggleFavourite?: () => Promise<boolean>;
}

export function LeaderboardItem({
  rank,
  description,
  username,
  voteCount,
  isCurrentUser,
  badgeEmoji,
  descriptionId,
  isFavourited,
  onToggleFavourite,
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
      <span className="text-xl font-bold shrink-0 w-10 text-center" aria-label={`#${rank}`}>
        {getRankEmoji(rank)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-base text-text break-words">
          &ldquo;{formatDescription(description)}&rdquo;
        </p>
        <p className="text-sm text-text-muted">
          @{username} {badgeEmoji && <span aria-hidden="true">{badgeEmoji}</span>}
          {isCurrentUser && (
            <span className="ml-2 text-xs font-bold text-primary">{t('you_label')}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-xs text-text-muted">{t('vote_count_short', { count: voteCount })}</span>
        {descriptionId && onToggleFavourite && (
          <FavouriteButton
            isFavourited={!!isFavourited}
            onToggle={onToggleFavourite}
            size={14}
          />
        )}
      </div>
    </div>
  );
}
