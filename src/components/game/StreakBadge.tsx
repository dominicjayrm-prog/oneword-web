import { getTranslations } from '@/lib/i18n';

interface StreakBadgeProps {
  streak: number;
  language?: string;
}

export function StreakBadge({ streak, language }: StreakBadgeProps) {
  if (streak === 0) return null;
  const t = getTranslations(language);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
      &#128293; {t.dayStreak(streak)}
    </span>
  );
}
