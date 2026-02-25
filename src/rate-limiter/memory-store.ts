import type { RateLimitEntry, RateLimitStore } from "./rate-limiter.js";

interface WindowEntry {
    count: number;
    resetAt: number;
}

/**
 * In-memory rate limit store for development and testing.
 * Uses a Map with automatic window expiry.
 *
 * NOT suitable for production with multiple server instances —
 * use a Redis-backed store instead.
 */
export function createMemoryRateLimitStore(): RateLimitStore {
    const windows = new Map<string, WindowEntry>();

    return {
        async increment(
            key: string,
            windowMs: number,
        ): Promise<RateLimitEntry> {
            const now = Date.now();
            const existing = windows.get(key);

            // If no entry or window has expired, start a new window
            if (!existing || existing.resetAt <= now) {
                const entry: WindowEntry = {
                    count: 1,
                    resetAt: now + windowMs,
                };
                windows.set(key, entry);
                return { count: entry.count, resetAt: entry.resetAt };
            }

            // Increment existing window
            existing.count++;
            return { count: existing.count, resetAt: existing.resetAt };
        },
    };
}
