import { describe, it, expect } from "vitest";
import {
  createAuth,
  signJWT,
  verifyJWT,
  requireAuth,
  requireRole,
  requireAnyRole,
  requirePermission,
  requireAllPermissions,
  AuthError,
} from "../src/index.js";
import type { GuardContext } from "../src/index.js";

const TEST_SECRET = "test-secret-key-that-is-long-enough-32";
const TEST_REFRESH_SECRET = "test-refresh-secret-key-long-32x";

// ── JWT Core ──────────────────────────────────────────────

describe("signJWT / verifyJWT", () => {
  it("should sign and verify a token", () => {
    const payload = { userId: "123", role: "admin" };
    const token = signJWT(payload, {
      secret: TEST_SECRET,
      expiresIn: "1h",
    });

    expect(token).toBeTypeOf("string");

    const decoded = verifyJWT<typeof payload>(token, {
      secret: TEST_SECRET,
    });

    expect(decoded.userId).toBe("123");
    expect(decoded.role).toBe("admin");
  });

  it("should throw TOKEN_INVALID for a bad token", () => {
    expect(() =>
      verifyJWT("not-a-real-token", { secret: TEST_SECRET }),
    ).toThrow(AuthError);
  });

  it("should throw TOKEN_EXPIRED for an expired token", () => {
    const token = signJWT(
      { userId: "123" },
      { secret: TEST_SECRET, expiresIn: "0s" },
    );

    // Small delay so the token is actually expired
    expect(() => verifyJWT(token, { secret: TEST_SECRET })).toThrow(AuthError);
  });

  it("should respect issuer validation", () => {
    const token = signJWT(
      { userId: "123" },
      { secret: TEST_SECRET, expiresIn: "1h", issuer: "my-service" },
    );

    expect(() =>
      verifyJWT(token, { secret: TEST_SECRET, issuer: "wrong-issuer" }),
    ).toThrow(AuthError);
  });
});

// ── Auth Factory ──────────────────────────────────────────

describe("createAuth", () => {
  it("should throw if jwtSecret is missing", () => {
    expect(() => createAuth({ jwtSecret: "" })).toThrow(
      "jwtSecret is required",
    );
  });

  it("should issue and verify access tokens", () => {
    const auth = createAuth({ jwtSecret: TEST_SECRET });

    const token = auth.issueAccessToken({ userId: "user_1" });
    const payload = auth.verifyAccessToken(token);

    expect(payload.userId).toBe("user_1");
  });

  it("should issue and verify refresh tokens", () => {
    const auth = createAuth({
      jwtSecret: TEST_SECRET,
      refreshTokenSecret: TEST_REFRESH_SECRET,
    });

    const token = auth.issueRefreshToken({ userId: "user_1", tokenVersion: 1 });
    const payload = auth.verifyRefreshToken(token);

    expect(payload.userId).toBe("user_1");
    expect(payload.tokenVersion).toBe(1);
  });

  it("should use separate secrets for access and refresh tokens", () => {
    const auth = createAuth({
      jwtSecret: TEST_SECRET,
      refreshTokenSecret: TEST_REFRESH_SECRET,
    });

    const refreshToken = auth.issueRefreshToken({
      userId: "user_1",
      tokenVersion: 1,
    });

    // Verifying a refresh token with the access token method should fail
    expect(() => auth.verifyAccessToken(refreshToken)).toThrow(AuthError);
  });

  it("should throw TOKEN_MISSING for empty string", () => {
    const auth = createAuth({ jwtSecret: TEST_SECRET });

    expect(() => auth.verifyAccessToken("")).toThrow(AuthError);
    expect(() => auth.verifyRefreshToken("")).toThrow(AuthError);
  });
});

// ── Guards ────────────────────────────────────────────────

describe("guards", () => {
  const authenticatedCtx: GuardContext = {
    user: {
      userId: "u1",
      role: "admin",
      permissions: ["read", "write", "delete"],
    },
  };

  const unauthenticatedCtx: GuardContext = {};

  const limitedCtx: GuardContext = {
    user: { userId: "u2", role: "viewer", permissions: ["read"] },
  };

  describe("requireAuth", () => {
    it("should pass for authenticated users", () => {
      expect(() => requireAuth()(authenticatedCtx)).not.toThrow();
    });

    it("should throw UNAUTHORIZED for unauthenticated users", () => {
      expect(() => requireAuth()(unauthenticatedCtx)).toThrow(AuthError);
    });
  });

  describe("requireRole", () => {
    it("should pass for matching role", () => {
      expect(() => requireRole("admin")(authenticatedCtx)).not.toThrow();
    });

    it("should throw FORBIDDEN for non-matching role", () => {
      expect(() => requireRole("admin")(limitedCtx)).toThrow(AuthError);
    });
  });

  describe("requireAnyRole", () => {
    it("should pass if user has any of the specified roles", () => {
      expect(() =>
        requireAnyRole(["admin", "editor"])(authenticatedCtx),
      ).not.toThrow();
    });

    it("should throw FORBIDDEN if user has none of the specified roles", () => {
      expect(() => requireAnyRole(["editor", "moderator"])(limitedCtx)).toThrow(
        AuthError,
      );
    });
  });

  describe("requirePermission", () => {
    it("should pass for matching permission", () => {
      expect(() => requirePermission("read")(authenticatedCtx)).not.toThrow();
    });

    it("should throw FORBIDDEN for missing permission", () => {
      expect(() => requirePermission("delete")(limitedCtx)).toThrow(AuthError);
    });
  });

  describe("requireAllPermissions", () => {
    it("should pass if user has all permissions", () => {
      expect(() =>
        requireAllPermissions(["read", "write"])(authenticatedCtx),
      ).not.toThrow();
    });

    it("should throw FORBIDDEN if user is missing any permission", () => {
      expect(() =>
        requireAllPermissions(["read", "write"])(limitedCtx),
      ).toThrow(AuthError);
    });
  });
});
