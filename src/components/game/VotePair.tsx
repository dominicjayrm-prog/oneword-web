'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getTranslations } from '@/lib/i18n';

interface VotePairProps {
  optionA: { id: string; description: string };
  optionB: { id: string; description: string };
  onVote: (winnerId: string, loserId: string) => void;
  language?: string;
}

export function VotePair({ optionA, optionB, onVote, language }: VotePairProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const t = getTranslations(language);

  function handleVote(winnerId: string, loserId: string) {
    if (selected) return;
    setSelected(winnerId);
    setTimeout(() => onVote(winnerId, loserId), 600);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {[
        { option: optionA, other: optionB },
        { option: optionB, other: optionA },
      ].map(({ option, other }) => (
        <motion.button
          key={option.id}
          whileHover={!selected ? { scale: 1.02 } : {}}
          whileTap={!selected ? { scale: 0.98 } : {}}
          onClick={() => handleVote(option.id, other.id)}
          disabled={!!selected}
          className={cn(
            'flex-1 cursor-pointer rounded-2xl border-2 p-6 text-center transition-all',
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
          {selected === option.id && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-block text-sm font-bold text-primary"
            >
              {t.yourPick}
            </motion.span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
