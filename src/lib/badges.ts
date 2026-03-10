export interface BadgeTier {
  streak: number;
  emoji: string;
  name: { en: string; es: string };
  color: string;
  glow: string;
  bgGrad: [string, string];
}

export const BADGE_TIERS: BadgeTier[] = [
  { streak: 3, emoji: '✨', name: { en: 'Spark', es: 'Chispa' }, color: '#FF8A6B', glow: 'rgba(255,138,107,0.4)', bgGrad: ['#1A1A2E', '#2E1A1A'] },
  { streak: 7, emoji: '🔥', name: { en: 'On Fire', es: 'En Llamas' }, color: '#FF6B4A', glow: 'rgba(255,107,74,0.35)', bgGrad: ['#1A1A2E', '#2E1510'] },
  { streak: 14, emoji: '⚡', name: { en: 'Unstoppable', es: 'Imparable' }, color: '#4A9BFF', glow: 'rgba(74,155,255,0.3)', bgGrad: ['#1A1A2E', '#101A2E'] },
  { streak: 30, emoji: '👑', name: { en: 'Crowned', es: 'Coronado' }, color: '#FFD700', glow: 'rgba(255,215,0,0.3)', bgGrad: ['#1A1A2E', '#2E2810'] },
  { streak: 50, emoji: '💎', name: { en: 'Diamond', es: 'Diamante' }, color: '#88E5FF', glow: 'rgba(136,229,255,0.3)', bgGrad: ['#1A1A2E', '#102028'] },
  { streak: 100, emoji: '⭐', name: { en: 'Legend', es: 'Leyenda' }, color: '#FFD700', glow: 'rgba(255,215,0,0.5)', bgGrad: ['#1A1A2E', '#2E2200'] },
  { streak: 365, emoji: '♾️', name: { en: 'Eternal', es: 'Eterno' }, color: '#FF6B4A', glow: 'rgba(255,107,74,0.5)', bgGrad: ['#1A1A2E', '#2D1B69'] },
];

export function getCurrentBadge(streak: number): BadgeTier | null {
  let badge: BadgeTier | null = null;
  for (const tier of BADGE_TIERS) {
    if (streak >= tier.streak) badge = tier;
    else break;
  }
  return badge;
}

export function getNextBadge(streak: number): BadgeTier | null {
  for (const tier of BADGE_TIERS) {
    if (streak < tier.streak) return tier;
  }
  return null;
}

export function getProgressToNext(streak: number): number {
  const current = getCurrentBadge(streak);
  const next = getNextBadge(streak);
  if (!next) return 1; // Max tier reached
  const base = current ? current.streak : 0;
  return (streak - base) / (next.streak - base);
}
