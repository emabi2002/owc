/**
 * Rate limiting (OWASP A04/A07 — abuse & brute-force protection).
 *
 * A lightweight in-memory fixed-window limiter suitable for a single Node
 * instance (PM2 fork mode or one container). For multi-instance deployments
 * set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN and swap the store for
 * @upstash/ratelimit (see docs/SECURITY_CHECKLIST.md) — the call sites do not
 * need to change.
 */

type Bucket = { count: number; reset: number };

const store = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms
  retryAfter: number; // seconds
};

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.reset) {
    const reset = now + windowMs;
    store.set(key, { count: 1, reset });
    return { success: true, limit, remaining: limit - 1, reset, retryAfter: 0 };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const success = bucket.count <= limit;
  return {
    success,
    limit,
    remaining,
    reset: bucket.reset,
    retryAfter: success ? 0 : Math.ceil((bucket.reset - now) / 1000),
  };
}

/** Best-effort client IP from proxy headers (Nginx sets X-Forwarded-For). */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/** Standard headers to attach to a 429 response. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(Math.ceil(r.reset / 1000)),
    ...(r.retryAfter ? { "Retry-After": String(r.retryAfter) } : {}),
  };
}

// Periodic cleanup of expired buckets to bound memory.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (now > bucket.reset) store.delete(key);
    }
  }, 5 * 60_000);
  // Do not keep the event loop alive for cleanup alone.
  (timer as { unref?: () => void }).unref?.();
}
