import type { StoredRefreshToken, TokenStore } from "./token-manager.js";

/**
 * In-memory TokenStore for development and testing.
 * NOT suitable for production — data is lost on restart.
 *
 * @example
 * ```ts
 * const store = createMemoryStore();
 * const tokenManager = createTokenManager({ auth, store });
 * ```
 */
export function createMemoryStore(): TokenStore {
    const tokens = new Map<string, StoredRefreshToken>();

    return {
        async save(token: StoredRefreshToken): Promise<void> {
            tokens.set(token.jti, { ...token });
        },

        async find(jti: string): Promise<StoredRefreshToken | null> {
            return tokens.get(jti) ?? null;
        },

        async revoke(jti: string): Promise<void> {
            const token = tokens.get(jti);
            if (token) {
                token.revokedAt = new Date();
            }
        },

        async revokeAllForUser(userId: string): Promise<void> {
            const now = new Date();
            for (const token of tokens.values()) {
                if (token.userId === userId && !token.revokedAt) {
                    token.revokedAt = now;
                }
            }
        },
    };
}
