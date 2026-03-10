'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface ShareCardProps {
  word: string;
  description: string;
  rank: number;
  totalPlayers: number;
}

export function ShareCard({ word, description, rank, totalPlayers }: ShareCardProps) {
  const t = useTranslations('results');

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
        // Clipboard API not available or permission denied
      }
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{t('your_result')}</p>
      <h3 className="mt-2 font-serif text-3xl font-black text-text">{word.toUpperCase()}</h3>
      <p className="mt-3 font-serif text-lg italic text-text">&ldquo;{description}&rdquo;</p>
      <p className="mt-4 font-mono text-2xl font-bold text-primary">#{rank}</p>
      <p className="text-sm text-text-muted">{t('out_of', { count: totalPlayers })}</p>
      <Button variant="primary" size="md" className="mt-4" onClick={handleShare}>
        {t('share_result')}
      </Button>
    </div>
  );
}
