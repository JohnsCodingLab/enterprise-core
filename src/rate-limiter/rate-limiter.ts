// ── Types ────────────────────────────────────────────────

export interface RateLimitEntry {
    count: number;
    resetAt: number; // unix timestamp ms
}

export interface RateLimitStore {
    /** Increment the counter for a key within a time window. */
    increment(key: string, windowMs: number): Promise<RateLimitEntry>;
}

export interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean;
    /** Remaining requests in the current window */
    remaining: number;
    /** When the window resets (unix timestamp ms) */
    resetAt: number;
    /** Milliseconds until retry (only when blocked) */
    retryAfterMs?: number | undefined;
}

export interface RateLimiterConfig {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum requests per window */
    max: number;
    /** Storage backend */
    store: RateLimitStore;
}

// ── Factory ──────────────────────────────────────────────

/**
 * Create a rate limiter with a sliding window algorithm.
 *
 * @example
 * ```ts
 * const limiter = createRateLimiter({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100,
 *   store: createMemoryRateLimitStore(),
 * });
 *
 * const result = await limiter.consume("user_123");
 * if (!result.allowed) {
 *   throw new RateLimitedError("Too many requests", Math.ceil(result.retryAfterMs! / 1000));
 * }
 * ```
 */
export function createRateLimiter(config: RateLimiterConfig) {
    const { windowMs, max, store } = config;

    return {
        /**
         * Attempt to consume a rate limit token for the given key.
         * Returns whether the request is allowed and remaining capacity.
         */
        async consume(key: string): Promise<RateLimitResult> {
            const entry = await store.increment(key, windowMs);

            if (entry.count > max) {
                return {
                    allowed: false,
                    remaining: 0,
                    resetAt: entry.resetAt,
                    retryAfterMs: entry.resetAt - Date.now(),
                };
            }

            return {
                allowed: true,
                remaining: max - entry.count,
                resetAt: entry.resetAt,
            };
        },
    };
}
