'use client';

import { useTranslations } from 'next-intl';
import { useToast } from '@/components/providers/ToastProvider';

interface FavouriteButtonProps {
  isFavourited: boolean;
  onToggle: () => Promise<boolean>;
  size?: number;
  className?: string;
}

export function FavouriteButton({ isFavourited, onToggle, size = 15, className = '' }: FavouriteButtonProps) {
  const t = useTranslations('favourites');
  const { showToast } = useToast();

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const isNowFavourited = await onToggle();
    showToast(isNowFavourited ? t('saved') : t('removed'), 'success');
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center transition-transform duration-150 hover:scale-110 ${className}`}
      aria-label={isFavourited ? t('removed') : t('saved')}
      type="button"
    >
      {isFavourited ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF6B4A" stroke="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8B8697" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
}
