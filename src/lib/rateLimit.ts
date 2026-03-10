interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  sign_in: { limit: 5, windowMs: 60_000 },
  sign_up: { limit: 3, windowMs: 120_000 },
  vote: { limit: 30, windowMs: 30_000 },
  friend_request: { limit: 10, windowMs: 60_000 },
  search: { limit: 15, windowMs: 10_000 },
  submit_description: { limit: 5, windowMs: 30_000 },
  report: { limit: 5, windowMs: 60_000 },
  password_reset: { limit: 3, windowMs: 120_000 },
};

const timestamps: Record<string, number[]> = {};

export function checkRateLimit(action: string): boolean {
  const config = RATE_LIMITS[action];
  if (!config) return true;

  const now = Date.now();
  if (!timestamps[action]) timestamps[action] = [];

  // Remove expired timestamps
  timestamps[action] = timestamps[action].filter((t) => now - t < config.windowMs);

  if (timestamps[action].length >= config.limit) {
    return false;
  }

  timestamps[action].push(now);
  return true;
}

export function getRateLimitReset(action: string): number {
  const config = RATE_LIMITS[action];
  if (!config || !timestamps[action]?.length) return 0;
  const oldest = timestamps[action][0];
  return Math.max(0, config.windowMs - (Date.now() - oldest));
}
