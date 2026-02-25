import { describe, it, expect } from "vitest";
import {
    createAuth,
    createTokenManager,
    createMemoryStore,
    AuthError,
} from "../src/index.js";

const TEST_SECRET = "test-secret-key-that-is-long-enough-32";
const TEST_REFRESH_SECRET = "test-refresh-secret-key-long-32x";

function makeTokenManager() {
    const auth = createAuth({
        jwtSecret: TEST_SECRET,
        refreshTokenSecret: TEST_REFRESH_SECRET,
        accessTokenExpiry: "15m",
        refreshTokenExpiry: "7d",
    });
    const store = createMemoryStore();
    return { tokenManager: createTokenManager({ auth, store }), store, auth };
}

describe("createTokenManager", () => {
    it("should issue a token pair with valid access and refresh tokens", async () => {
        const { tokenManager, auth } = makeTokenManager();

        const { accessToken, refreshToken } = await tokenManager.issueTokenPair(
            {
                userId: "u1",
                role: "admin",
                permissions: ["read", "write"],
            },
        );

        expect(accessToken).toBeTypeOf("string");
        expect(refreshToken).toBeTypeOf("string");

        // Access token should be verifiable
        const accessPayload = auth.verifyAccessToken(accessToken);
        expect(accessPayload.userId).toBe("u1");
        expect(accessPayload.role).toBe("admin");

        // Refresh token should contain jti
        const refreshPayload = auth.verifyRefreshToken(refreshToken);
        expect(refreshPayload.userId).toBe("u1");
        expect(refreshPayload.jti).toBeDefined();
    });

    it("should store the refresh token JTI in the store", async () => {
        const { tokenManager, store, auth } = makeTokenManager();

        const { refreshToken } = await tokenManager.issueTokenPair({
            userId: "u1",
        });

        const payload = auth.verifyRefreshToken(refreshToken);
        const stored = await store.find(payload.jti!);

        expect(stored).not.toBeNull();
        expect(stored!.userId).toBe("u1");
        expect(stored!.revokedAt).toBeUndefined();
    });

    it("should refresh tokens (rotation: old revoked, new issued)", async () => {
        const { tokenManager, store, auth } = makeTokenManager();

        const original = await tokenManager.issueTokenPair({ userId: "u1" });
        const originalPayload = auth.verifyRefreshToken(original.refreshToken);

        // Refresh
        const newTokens = await tokenManager.refresh(original.refreshToken);

        expect(newTokens.accessToken).toBeTypeOf("string");
        expect(newTokens.refreshToken).toBeTypeOf("string");
        expect(newTokens.refreshToken).not.toBe(original.refreshToken);

        // Old token should be revoked in store
        const oldStored = await store.find(originalPayload.jti!);
        expect(oldStored!.revokedAt).toBeDefined();
    });

    it("should reject refresh with a revoked token", async () => {
        const { tokenManager } = makeTokenManager();

        const { refreshToken } = await tokenManager.issueTokenPair({
            userId: "u1",
        });

        // Refresh once (revokes old token)
        await tokenManager.refresh(refreshToken);

        // Try to use the old token again — should fail
        await expect(tokenManager.refresh(refreshToken)).rejects.toThrow(
            AuthError,
        );
    });

    it("should revoke a single session", async () => {
        const { tokenManager } = makeTokenManager();

        const { refreshToken } = await tokenManager.issueTokenPair({
            userId: "u1",
        });
        await tokenManager.revokeSession(refreshToken);

        // Refreshing should now fail
        await expect(tokenManager.refresh(refreshToken)).rejects.toThrow(
            AuthError,
        );
    });

    it("should revoke all sessions for a user", async () => {
        const { tokenManager } = makeTokenManager();

        const t1 = await tokenManager.issueTokenPair({ userId: "u1" });
        const t2 = await tokenManager.issueTokenPair({ userId: "u1" });
        const t3 = await tokenManager.issueTokenPair({ userId: "u2" });

        // Revoke all for u1
        await tokenManager.revokeAllSessions("u1");

        // Both u1 tokens should fail
        await expect(tokenManager.refresh(t1.refreshToken)).rejects.toThrow(
            AuthError,
        );
        await expect(tokenManager.refresh(t2.refreshToken)).rejects.toThrow(
            AuthError,
        );

        // u2 token should still work
        const newTokens = await tokenManager.refresh(t3.refreshToken);
        expect(newTokens.accessToken).toBeTypeOf("string");
    });
});
