'use client';

import { useState, useEffect } from 'react';
import { msUntilNextWord, formatCountdown } from '@/lib/gameDate';
import { useTranslations } from 'next-intl';

export function CountdownTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('game');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial hydration sync
    setRemaining(msUntilNextWord());
    setMounted(true);
    const interval = setInterval(() => {
      setRemaining(msUntilNextWord());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <p className="text-xs text-text-muted">{t('next_word_in')}</p>
      <p className="font-mono text-lg font-bold text-text">
        {mounted && remaining !== null ? formatCountdown(remaining) : <span className="invisible">00:00:00</span>}
      </p>
    </div>
  );
}
