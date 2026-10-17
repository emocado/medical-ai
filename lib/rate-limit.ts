/**
 * Fixed-window rate limiter kept in memory. Good enough to stop one client
 * from draining the OpenCode quota on a single-instance deployment; a
 * multi-instance deployment would need a shared store instead.
 */

export interface RateLimitWindow {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  store: Map<string, RateLimitWindow>,
  key: string,
  now: number,
  limit: number,
  windowMs: number
): RateLimitResult {
  let window = store.get(key);
  if (!window || now >= window.resetAt) {
    window = { count: 0, resetAt: now + windowMs };
    store.set(key, window);
  }

  window.count += 1;
  const allowed = window.count <= limit;

  // Opportunistically drop expired windows so the map cannot grow unbounded.
  if (store.size > 5000) {
    store.forEach((w, k) => {
      if (now >= w.resetAt) store.delete(k);
    });
  }

  return {
    allowed,
    remaining: Math.max(0, limit - window.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((window.resetAt - now) / 1000),
  };
}
