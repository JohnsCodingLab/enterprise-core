import { randomUUID } from "node:crypto";
import { AuthError } from "../errors/auth-error.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "./types.js";

// ── Store Interface ─────────────────────────────────────

export interface StoredRefreshToken {
    jti: string;
    userId: string;
    tokenVersion: number;
    expiresAt: Date;
    createdAt: Date;
    revokedAt?: Date | undefined;
}

export interface TokenStore {
    /** Persist a new refresh token record */
    save(token: StoredRefreshToken): Promise<void>;

    /** Find a refresh token by JTI */
    find(jti: string): Promise<StoredRefreshToken | null>;

    /** Mark a single token as revoked */
    revoke(jti: string): Promise<void>;

    /** Revoke all tokens for a user (logout all sessions) */
    revokeAllForUser(userId: string): Promise<void>;
}

// ── Token Pair Result ───────────────────────────────────

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface IssueTokenPairParams {
    userId: string;
    role?: string;
    permissions?: string[];
    tokenVersion?: number;
}

// ── Token Manager Config ────────────────────────────────

export interface TokenManagerConfig {
    auth: {
        issueAccessToken(payload: AccessTokenPayload): string;
        issueRefreshToken(payload: RefreshTokenPayload): string;
        verifyRefreshToken(token: string): RefreshTokenPayload;
    };
    store: TokenStore;
    /** Refresh token TTL in milliseconds. Default: 7 days */
    refreshTokenTtlMs?: number | undefined;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ── Factory ─────────────────────────────────────────────

/**
 * Create a token manager that handles the full refresh token lifecycle
 * with JTI tracking and pluggable storage.
 *
 * @example
 * ```ts
 * const tokenManager = createTokenManager({
 *   auth: createAuth({ jwtSecret: "...", refreshTokenSecret: "..." }),
 *   store: createMemoryStore(), // or your own DB adapter
 * });
 *
 * const tokens = await tokenManager.issueTokenPair({ userId: "u1", role: "admin" });
 * const newTokens = await tokenManager.refresh(tokens.refreshToken);
 * await tokenManager.revokeSession(tokens.refreshToken);
 * await tokenManager.revokeAllSessions("u1");
 * ```
 */
export function createTokenManager(config: TokenManagerConfig) {
    const { auth, store, refreshTokenTtlMs = SEVEN_DAYS_MS } = config;

    return {
        /**
         * Issue a new access + refresh token pair.
         * The refresh token's JTI is persisted to the store.
         */
        async issueTokenPair(params: IssueTokenPairParams): Promise<TokenPair> {
            const { userId, role, permissions, tokenVersion = 0 } = params;

            const jti = randomUUID();

            const accessToken = auth.issueAccessToken({
                userId,
                role,
                permissions,
            });

            const refreshToken = auth.issueRefreshToken({
                userId,
                tokenVersion,
                jti,
            });

            await store.save({
                jti,
                userId,
                tokenVersion,
                expiresAt: new Date(Date.now() + refreshTokenTtlMs),
                createdAt: new Date(),
            });

            return { accessToken, refreshToken };
        },

        /**
         * Refresh an existing token pair.
         * Verifies the JWT, checks the store, revokes the old token,
         * and issues a new pair (token rotation).
         */
        async refresh(refreshToken: string): Promise<TokenPair> {
            // 1. Verify JWT signature + expiry
            const payload = auth.verifyRefreshToken(refreshToken);

            if (!payload.jti) {
                throw new AuthError("TOKEN_INVALID");
            }

            // 2. Look up in store
            const stored = await store.find(payload.jti);

            if (!stored) {
                throw new AuthError("TOKEN_INVALID");
            }

            // 3. Check not revoked
            if (stored.revokedAt) {
                throw new AuthError("TOKEN_INVALID");
            }

            // 4. Check not expired in store
            if (stored.expiresAt < new Date()) {
                throw new AuthError("TOKEN_EXPIRED");
            }

            // 5. Revoke old token (rotation)
            await store.revoke(payload.jti);

            // 6. Issue new pair
            return this.issueTokenPair({
                userId: payload.userId,
                tokenVersion: payload.tokenVersion,
            });
        },

        /**
         * Revoke a single session by its refresh token.
         * Used for logout.
         */
        async revokeSession(refreshToken: string): Promise<void> {
            const payload = auth.verifyRefreshToken(refreshToken);

            if (payload.jti) {
                await store.revoke(payload.jti);
            }
        },

        /**
         * Revoke all sessions for a user.
         * Used for "logout everywhere" or after password change.
         */
        async revokeAllSessions(userId: string): Promise<void> {
            await store.revokeAllForUser(userId);
        },
    };
}
