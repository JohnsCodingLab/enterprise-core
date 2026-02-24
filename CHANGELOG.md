# Changelog

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
