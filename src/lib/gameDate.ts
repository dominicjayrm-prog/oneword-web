const ROLLOVER_HOUR_UTC = 5;

export function getGameDate(): string {
  const now = new Date();
  const adjusted = new Date(now.getTime() - ROLLOVER_HOUR_UTC * 60 * 60 * 1000);
  return adjusted.toISOString().split('T')[0];
}

export function getGameDay(): number {
  const dateStr = getGameDate();
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
}

export function getGameMonday(gameDateStr?: string): string {
  const dateStr = gameDateStr || getGameDate();
  const d = new Date(dateStr + 'T12:00:00Z');
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().split('T')[0];
}

export function msUntilNextWord(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(ROLLOVER_HOUR_UTC, 0, 0, 0);
  // If it's before today's rollover, next word is today at rollover
  const todayRollover = new Date(now);
  todayRollover.setUTCHours(ROLLOVER_HOUR_UTC, 0, 0, 0);
  if (now < todayRollover) {
    return todayRollover.getTime() - now.getTime();
  }
  return tomorrow.getTime() - now.getTime();
}

export function hasWordRolledOver(lastKnownGameDate: string): boolean {
  return getGameDate() !== lastKnownGameDate;
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
