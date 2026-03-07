interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
      &#128293; {streak} day streak
    </span>
  );
}
