'use client';

import { useState, useEffect } from 'react';
import { msUntilNextWord, formatCountdown } from '@/lib/gameDate';
import { useTranslations } from 'next-intl';

export function CountdownTimer() {
  const [remaining, setRemaining] = useState(msUntilNextWord());
  const t = useTranslations('game');

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(msUntilNextWord());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <p className="text-xs text-text-muted">{t('next_word_in')}</p>
      <p className="font-mono text-lg font-bold text-text">{formatCountdown(remaining)}</p>
    </div>
  );
}
