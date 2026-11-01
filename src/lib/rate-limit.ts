/**
 * Sliding-window rate limiter held in process memory.
 * Suitable for a single Node instance; for several instances put a shared store (e.g. Redis) behind
 * the same interface — see docs/DEPLOYMENT.md.
 */
export class SlidingWindowLimiter {
  private hits = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly maxKeys = 50_000,
  ) {}

  /** Records an attempt and returns whether it is allowed, plus seconds until the next slot frees. */
  take(key: string, now = Date.now()): { allowed: boolean; retryAfter: number; remaining: number } {
    this.sweep(now);
    const since = now - this.windowMs;
    const list = (this.hits.get(key) ?? []).filter((t) => t > since);
    if (list.length >= this.max) {
      this.hits.set(key, list);
      const retryAfter = Math.max(1, Math.ceil((list[0]! + this.windowMs - now) / 1000));
      return { allowed: false, retryAfter, remaining: 0 };
    }
    list.push(now);
    this.hits.set(key, list);
    return { allowed: true, retryAfter: 0, remaining: this.max - list.length };
  }

  private sweep(now: number) {
    if (now - this.lastSweep < this.windowMs && this.hits.size < this.maxKeys) return;
    this.lastSweep = now;
    const since = now - this.windowMs;
    for (const [k, v] of this.hits) {
      if (!v.some((t) => t > since)) this.hits.delete(k);
    }
    // Hard cap against memory exhaustion from many distinct keys: drop oldest entries.
    while (this.hits.size > this.maxKeys) {
      const first = this.hits.keys().next().value;
      if (first === undefined) break;
      this.hits.delete(first);
    }
  }
}
