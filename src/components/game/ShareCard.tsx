'use client';

import { Button } from '@/components/ui/Button';
import { getTranslations } from '@/lib/i18n';

interface ShareCardProps {
  word: string;
  description: string;
  rank: number;
  totalPlayers: number;
  language?: string;
}

export function ShareCard({ word, description, rank, totalPlayers, language }: ShareCardProps) {
  const t = getTranslations(language);

  async function handleShare() {
    const text = t.shareText(word, description, rank, totalPlayers);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{t.yourResult}</p>
      <h3 className="mt-2 font-serif text-3xl font-black text-text">{word.toUpperCase()}</h3>
      <p className="mt-3 font-serif text-lg italic text-text">&ldquo;{description}&rdquo;</p>
      <p className="mt-4 font-mono text-2xl font-bold text-primary">#{rank}</p>
      <p className="text-sm text-text-muted">{t.outOf(totalPlayers)}</p>
      <Button variant="primary" size="md" className="mt-4" onClick={handleShare}>
        {t.shareResult}
      </Button>
    </div>
  );
}
