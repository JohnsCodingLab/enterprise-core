# Changelog

## [0.2.0] - 2026-02-25

### Added

- **Token Manager**
    - `createTokenManager` factory with JTI-based refresh token lifecycle
    - Token rotation on refresh (old token revoked, new pair issued)
    - `revokeSession` (logout) and `revokeAllSessions` (logout everywhere)
    - `createMemoryStore` in-memory TokenStore for development
    - `TokenStore` interface for pluggable storage (DB, Redis, etc.)

- **Rate Limiter**
    - `createRateLimiter` with sliding window algorithm
    - `createMemoryRateLimitStore` for development
    - `RateLimitStore` interface for pluggable backends

- **Pagination Helper**
    - `paginate(params)` — calculates offset, totalPages, hasNext/hasPrev
    - Input validation with clamping

- **Response Envelope**
    - `success(data, meta?)` — standardized success response wrapper
    - `error(err, opts?)` — standardized error response wrapper
    - `ApiResponse<T>` union type for consumers

## [0.1.0] - 2026-02-24

### Added

- **Auth Module**
    - `createAuth` factory with `issueAccessToken`, `issueRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`
    - Separate `refreshTokenSecret` support for access/refresh token isolation
    - Low-level `signJWT` and `verifyJWT` utilities
    - Guards: `requireAuth`, `requireRole`, `requireAnyRole`, `requirePermission`, `requireAllPermissions`

- **Error Module**
    - Base `AppError` class with `code`, `statusCode`, `metadata`, `isOperational`
    - `AuthError` for auth-specific errors (401)
    - HTTP convenience classes: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `RateLimitedError` (429)
    - `serializeError` utility with optional stack trace inclusion

- **Config Module**
    - `loadConfig` for built-in `AppConfig` (auth + server)
    - `createConfigLoader` generic factory for custom config shapes
    - Schema validators: `requireString`, `requireNumber`, `requireBoolean`, `optionalString`, `optionalNumber`
    - `ConfigError` for descriptive validation failures

- **Utils Module**
    - `hashPassword` / `verifyPassword` using Node.js native `crypto.scrypt` (zero external deps)
    - `createLogger` structured JSON logger with configurable levels
    - `generateRequestId` (UUID v4) and `extractBearerToken` helpers
