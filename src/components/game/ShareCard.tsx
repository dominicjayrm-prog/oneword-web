'use client';

import { Button } from '@/components/ui/Button';

interface ShareCardProps {
  word: string;
  description: string;
  rank: number;
  totalPlayers: number;
}

export function ShareCard({ word, description, rank, totalPlayers }: ShareCardProps) {
  async function handleShare() {
    const text = `OneWord - ${word.toUpperCase()}\n\n"${description}"\n\nI ranked #${rank} out of ${totalPlayers} players!\n\nPlay at oneword.game`;
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
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Your result</p>
      <h3 className="mt-2 font-serif text-3xl font-black text-text">{word.toUpperCase()}</h3>
      <p className="mt-3 font-serif text-lg italic text-text">&ldquo;{description}&rdquo;</p>
      <p className="mt-4 font-mono text-2xl font-bold text-primary">#{rank}</p>
      <p className="text-sm text-text-muted">out of {totalPlayers} players</p>
      <Button variant="primary" size="md" className="mt-4" onClick={handleShare}>
        Share Result
      </Button>
    </div>
  );
}
