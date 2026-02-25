import { describe, it, expect, vi } from "vitest";
import { createRateLimiter, createMemoryRateLimitStore } from "../src/index.js";

describe("createRateLimiter", () => {
    it("should allow requests under the limit", async () => {
        const limiter = createRateLimiter({
            windowMs: 60_000,
            max: 5,
            store: createMemoryRateLimitStore(),
        });

        const result = await limiter.consume("user_1");
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
    });

    it("should track remaining correctly", async () => {
        const limiter = createRateLimiter({
            windowMs: 60_000,
            max: 3,
            store: createMemoryRateLimitStore(),
        });

        expect((await limiter.consume("user_1")).remaining).toBe(2);
        expect((await limiter.consume("user_1")).remaining).toBe(1);
        expect((await limiter.consume("user_1")).remaining).toBe(0);
    });

    it("should block requests over the limit", async () => {
        const limiter = createRateLimiter({
            windowMs: 60_000,
            max: 2,
            store: createMemoryRateLimitStore(),
        });

        await limiter.consume("user_1");
        await limiter.consume("user_1");

        const result = await limiter.consume("user_1");
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it("should isolate different keys", async () => {
        const limiter = createRateLimiter({
            windowMs: 60_000,
            max: 1,
            store: createMemoryRateLimitStore(),
        });

        await limiter.consume("user_1");
        const result = await limiter.consume("user_2");

        expect(result.allowed).toBe(true);
    });

    it("should reset after window expiry", async () => {
        vi.useFakeTimers();

        const limiter = createRateLimiter({
            windowMs: 1000, // 1 second
            max: 1,
            store: createMemoryRateLimitStore(),
        });

        await limiter.consume("user_1");
        expect((await limiter.consume("user_1")).allowed).toBe(false);

        // Advance past the window
        vi.advanceTimersByTime(1100);

        const result = await limiter.consume("user_1");
        expect(result.allowed).toBe(true);

        vi.useRealTimers();
    });
});
