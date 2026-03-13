'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFavouritePhrases } from '@/lib/hooks/useFavourites';
import { useFavourites } from '@/lib/hooks/useFavourites';
import { FavouriteButton } from '@/components/game/FavouriteButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDescription } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FavouritePhrasesProps {
  userId: string;
  onBack: () => void;
}

type Tab = 'mine' | 'community';

export function FavouritePhrases({ userId, onBack }: FavouritePhrasesProps) {
  const t = useTranslations('favourites');
  const { phrases, loading, fetchPhrases } = useFavouritePhrases(userId);
  const { isFavourited, toggleFavourite } = useFavourites(userId);
  const [tab, setTab] = useState<Tab>('mine');

  const mine = phrases.filter((p) => p.is_own);
  const community = phrases.filter((p) => !p.is_own);
  const current = tab === 'mine' ? mine : community;

  async function handleToggle(descriptionId: string) {
    const result = await toggleFavourite(descriptionId);
    // Refresh list after unfavourite
    if (!result) fetchPhrases();
    return result;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-lg text-text-muted hover:text-text transition-colors cursor-pointer"
          aria-label="Back"
        >
          &larr;
        </button>
        <h2 className="font-serif text-xl font-bold text-text">
          <span className="text-primary">&hearts;</span> {t('title')}
        </h2>
      </div>

      {/* Tab toggle */}
      <div className="mt-4 flex rounded-xl bg-surface p-1">
        {(['mine', 'community'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all cursor-pointer',
              tab === tabKey
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            )}
          >
            {t(tabKey)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : current.length > 0 ? (
          current.map((phrase) => {
            const date = phrase.created_at
              ? new Date(phrase.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '';
            return (
              <div
                key={phrase.description_id}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-[13px] font-bold uppercase tracking-[1.5px] text-text">
                    {phrase.word?.toUpperCase()}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">{date}</span>
                </div>
                <p className="mt-2 text-[15px] font-medium italic text-text">
                  &ldquo;{formatDescription(phrase.description)}&rdquo;
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-text-muted">
                    {tab === 'community' && (
                      <span className="font-semibold">@{phrase.username}</span>
                    )}
                    {tab === 'community' && phrase.rank && ' \u00b7 '}
                    {phrase.rank && (
                      <span className="text-primary">#{phrase.rank}</span>
                    )}
                    {phrase.rank && ' \u00b7 '}
                    {phrase.vote_count} votes
                  </p>
                  <FavouriteButton
                    isFavourited={isFavourited(phrase.description_id)}
                    onToggle={() => handleToggle(phrase.description_id)}
                    size={14}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-text-muted">
              {tab === 'mine' ? t('emptyMine') : t('emptyCommunity')}{' '}
              <span className="text-primary">&hearts;</span>
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {tab === 'mine' ? t('emptyMineSubtitle') : t('emptyCommunitySubtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
