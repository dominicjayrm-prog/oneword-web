'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface ShareCardProps {
  word: string;
  description: string;
  rank: number;
  totalPlayers: number;
  streak?: number;
  votes?: number;
}

export function ShareCard({ word, description, rank, totalPlayers, streak, votes }: ShareCardProps) {
  const t = useTranslations('results');
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const text = t('share_text', { word: word.toUpperCase(), desc: description, rank, total: totalPlayers });
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Clipboard API not available
      }
    }
  }

  return (
    <div>
      {/* Shareable card preview */}
      <div
        ref={cardRef}
        className="rounded-2xl p-6 text-center"
        style={{ background: 'linear-gradient(to bottom, #1A1A2E, #2D1B69)' }}
      >
        <p className="font-serif text-sm font-bold text-white/50">oneword</p>
        <h3 className="mt-3 font-serif text-3xl font-black text-white">{word.toUpperCase()}</h3>
        <p className="mt-3 font-serif text-lg italic text-white/80">&ldquo;{description}&rdquo;</p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div>
            <p className="font-mono text-2xl font-bold text-primary">#{rank}</p>
            <p className="text-xs text-white/50">{t('out_of', { count: totalPlayers })}</p>
          </div>
          {votes != null && (
            <div>
              <p className="font-mono text-2xl font-bold text-white">{votes}</p>
              <p className="text-xs text-white/50">{t('votes_label')}</p>
            </div>
          )}
          {streak != null && streak > 0 && (
            <div>
              <p className="font-mono text-2xl font-bold text-white"><span aria-hidden="true">🔥</span> {streak}</p>
              <p className="text-xs text-white/50">{t('streak_label')}</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-white/30">playoneword.app</p>
      </div>
      <Button variant="primary" size="md" className="mt-4 w-full" onClick={handleShare}>
        {t('share_result')}
      </Button>
    </div>
  );
}
