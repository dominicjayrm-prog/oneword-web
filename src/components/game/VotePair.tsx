'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface VoteOption {
  id: string;
  description: string;
  username?: string;
  badgeEmoji?: string;
}

interface VotePairProps {
  optionA: VoteOption;
  optionB: VoteOption;
  onVote: (winnerId: string, loserId: string) => void;
  onReport?: (descriptionId: string) => void;
}

export function VotePair({ optionA, optionB, onVote, onReport }: VotePairProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const t = useTranslations('game');
  const tReport = useTranslations('report');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleVote(winnerId: string, loserId: string) {
    if (selected) return;
    setSelected(winnerId);
    timerRef.current = setTimeout(() => onVote(winnerId, loserId), 600);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {[
        { option: optionA, other: optionB },
        { option: optionB, other: optionA },
      ].map(({ option, other }) => (
        <div key={option.id} className="flex-1">
          <motion.button
            whileHover={!selected ? { scale: 1.02 } : {}}
            whileTap={!selected ? { scale: 0.98 } : {}}
            onClick={() => handleVote(option.id, other.id)}
            disabled={!!selected}
            className={cn(
              'w-full cursor-pointer rounded-2xl border-2 p-6 text-center transition-all',
              selected === option.id
                ? 'border-primary bg-primary-light'
                : selected
                ? 'border-border bg-surface/50 opacity-50'
                : 'border-border bg-white hover:border-primary/50'
            )}
          >
            <p className="font-serif text-xl italic text-text">
              &ldquo;{option.description}&rdquo;
            </p>
            {option.username && (
              <p className="mt-2 text-xs text-text-muted">
                @{option.username} {option.badgeEmoji || ''}
              </p>
            )}
            {selected === option.id && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 inline-block text-sm font-bold text-primary"
              >
                {t('your_pick')}
              </motion.span>
            )}
          </motion.button>
          {onReport && (
            <button
              onClick={() => onReport(option.id)}
              className="mt-1 w-full text-center text-xs text-text-muted/50 hover:text-text-muted transition-colors cursor-pointer"
            >
              {tReport('report_link')}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
