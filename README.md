# @johnscodinglab/enterprise-core

Enterprise-grade, framework-agnostic core utilities for Node.js backend development.

## Why This Package?

Modern backend teams rewrite the same logic repeatedly:

- JWT authentication with access & refresh tokens
- Error handling with proper HTTP status codes
- Environment configuration with validation
- Authorization guards (roles & permissions)
- Password hashing
- Structured logging

This package provides **secure defaults**, **clean APIs**, and **TypeScript-first tooling** — without locking you into any framework. Works with **Express, Fastify, NestJS, Hono, or plain Node.js**.

## Installation

```bash
npm install @johnscodinglab/enterprise-core
```

> **Requires Node.js ≥ 20**

---

## 🔐 Authentication

### JWT Token Management

```typescript
import { createAuth } from "@johnscodinglab/enterprise-core";

const auth = createAuth({
  jwtSecret: process.env.JWT_SECRET!,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET!, // optional, defaults to jwtSecret
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
  issuer: "my-api",
});

// Issue tokens
const accessToken = auth.issueAccessToken({
  userId: "user_123",
  role: "admin",
});
const refreshToken = auth.issueRefreshToken({
  userId: "user_123",
  tokenVersion: 1,
});

// Verify tokens
const accessPayload = auth.verifyAccessToken(accessToken);
const refreshPayload = auth.verifyRefreshToken(refreshToken);
```

### Low-Level JWT Utilities

```typescript
import { signJWT, verifyJWT } from "@johnscodinglab/enterprise-core";

const token = signJWT(
  { data: "hello" },
  {
    secret: "my-secret",
    expiresIn: "1h",
    algorithm: "HS256", // default
  },
);

const payload = verifyJWT<{ data: string }>(token, { secret: "my-secret" });
```

---

## 🛡️ Guards

Framework-agnostic authorization guards that work with any request context.

```typescript
import {
  requireAuth,
  requireRole,
  requireAnyRole,
  requirePermission,
  requireAllPermissions,
} from "@johnscodinglab/enterprise-core";

// Define your context (attach user after JWT verification)
const ctx = {
  user: {
    userId: "u1",
    role: "admin",
    permissions: ["read", "write", "delete"],
  },
};

// Use guards
requireAuth()(ctx); // throws if no user
requireRole("admin")(ctx); // throws FORBIDDEN if wrong role
requireAnyRole(["admin", "editor"])(ctx); // throws if role not in list
requirePermission("write")(ctx); // throws if missing permission
requireAllPermissions(["read", "write"])(ctx); // throws if missing any
```

### Express Middleware Example

```typescript
function authMiddleware(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    req.user = auth.verifyAccessToken(token!);
    next();
  } catch (error) {
    res.status(401).json(serializeError(error));
  }
}

function adminOnly(req, res, next) {
  try {
    requireRole("admin")({ user: req.user });
    next();
  } catch (error) {
    res.status(403).json(serializeError(error));
  }
}
```

---

## � Error Handling

### Error Hierarchy

| Class               | Status | Code                                     |
| ------------------- | ------ | ---------------------------------------- |
| `BadRequestError`   | 400    | `BAD_REQUEST`                            |
| `UnauthorizedError` | 401    | `UNAUTHORIZED`                           |
| `AuthError`         | 401    | `TOKEN_*` / `UNAUTHORIZED` / `FORBIDDEN` |
| `ForbiddenError`    | 403    | `FORBIDDEN`                              |
| `NotFoundError`     | 404    | `NOT_FOUND`                              |
| `ConflictError`     | 409    | `CONFLICT`                               |
| `RateLimitedError`  | 429    | `RATE_LIMITED`                           |
| `AppError`          | any    | any `ErrorCode`                          |

```typescript
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  RateLimitedError,
  serializeError,
} from "@johnscodinglab/enterprise-core";

// Throw typed errors
throw new NotFoundError("User not found");
throw new BadRequestError("Invalid email", { field: "email" });
throw new ConflictError("Username taken");
throw new RateLimitedError("Too many requests", 60); // retryAfterSeconds

// Serialize for API responses
app.use((err, req, res, next) => {
  const serialized = serializeError(err, {
    includeStack: process.env.NODE_ENV === "development",
  });
  res.status(serialized.statusCode).json(serialized);
});
```

---

## ⚙️ Configuration

### Built-In Config Loader

```typescript
import { loadConfig } from "@johnscodinglab/enterprise-core";

// Reads from process.env with validation
const config = loadConfig(process.env);

config.auth.jwt.accessTokenSecret; // string (required)
config.auth.jwt.refreshTokenSecret; // string (required)
config.auth.jwt.accessTokenTtl; // string (default: "15m")
config.auth.jwt.refreshTokenTtl; // string (default: "7d")
config.server.port; // number (required)
config.server.nodeEnv; // "development" | "production" | "test"
```

### Custom Config Loader

```typescript
import {
  createConfigLoader,
  requireString,
  requireNumber,
  requireBoolean,
  optionalString,
} from "@johnscodinglab/enterprise-core";

const loadMyConfig = createConfigLoader((env) => ({
  databaseUrl: requireString(env, "DATABASE_URL"),
  port: requireNumber(env, "PORT"),
  debug: requireBoolean(env, "DEBUG"),
  logLevel: optionalString(env, "LOG_LEVEL", "info"),
}));

const config = loadMyConfig(process.env);
// Throws ConfigError with descriptive message if any required var is missing
```

---

## 🔧 Utilities

### Password Hashing

Zero-dependency password hashing using Node.js native `crypto.scrypt`.

```typescript
import { hashPassword, verifyPassword } from "@johnscodinglab/enterprise-core";

const hash = await hashPassword("my-secure-password");
// → "a1b2c3...:d4e5f6..."  (salt:hash format)

const isValid = await verifyPassword("my-secure-password", hash);
// → true (timing-safe comparison)
```

### Structured Logger

```typescript
import { createLogger } from "@johnscodinglab/enterprise-core";

const logger = createLogger({
  service: "auth-api",
  level: "info", // "debug" | "info" | "warn" | "error"
});

logger.info("User logged in", { userId: "123" });
// → {"timestamp":"2026-02-24T...","level":"info","message":"User logged in","service":"auth-api","userId":"123"}
```

### Request Utilities

```typescript
import {
  generateRequestId,
  extractBearerToken,
} from "@johnscodinglab/enterprise-core";

const requestId = generateRequestId();
// → "550e8400-e29b-41d4-a716-446655440000"

const token = extractBearerToken("Bearer eyJhbGci...");
// → "eyJhbGci..."

extractBearerToken(undefined); // → null
extractBearerToken("Basic abc123"); // → null
```

---

## API Reference

### Auth

| Export                         | Type     | Description                                                                                          |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `createAuth(config)`           | Function | Factory returning `issueAccessToken`, `issueRefreshToken`, `verifyAccessToken`, `verifyRefreshToken` |
| `signJWT(payload, options)`    | Function | Low-level JWT signing                                                                                |
| `verifyJWT(token, options)`    | Function | Low-level JWT verification                                                                           |
| `requireAuth()`                | Guard    | Requires authenticated user                                                                          |
| `requireRole(role)`            | Guard    | Requires specific role                                                                               |
| `requireAnyRole(roles)`        | Guard    | Requires any of the specified roles                                                                  |
| `requirePermission(perm)`      | Guard    | Requires specific permission                                                                         |
| `requireAllPermissions(perms)` | Guard    | Requires all specified permissions                                                                   |

### Errors

| Export                       | Type     | Description                                      |
| ---------------------------- | -------- | ------------------------------------------------ |
| `AppError`                   | Class    | Base error with `code`, `statusCode`, `metadata` |
| `AuthError`                  | Class    | Auth-specific error (401)                        |
| `HttpError`                  | Class    | Base HTTP error                                  |
| `BadRequestError`            | Class    | 400 errors                                       |
| `UnauthorizedError`          | Class    | 401 errors                                       |
| `ForbiddenError`             | Class    | 403 errors                                       |
| `NotFoundError`              | Class    | 404 errors                                       |
| `ConflictError`              | Class    | 409 errors                                       |
| `RateLimitedError`           | Class    | 429 errors                                       |
| `serializeError(err, opts?)` | Function | Serialize any error for API responses            |

### Config

| Export                              | Type     | Description                        |
| ----------------------------------- | -------- | ---------------------------------- |
| `loadConfig(env)`                   | Function | Load built-in `AppConfig` from env |
| `createConfigLoader(builder)`       | Function | Create custom typed config loader  |
| `requireString(env, key)`           | Function | Validate required string env var   |
| `requireNumber(env, key)`           | Function | Validate required numeric env var  |
| `requireBoolean(env, key)`          | Function | Validate required boolean env var  |
| `optionalString(env, key, default)` | Function | Optional string with default       |
| `optionalNumber(env, key, default)` | Function | Optional number with default       |

### Utils

| Export                           | Type           | Description                             |
| -------------------------------- | -------------- | --------------------------------------- |
| `hashPassword(password)`         | Async Function | Hash with scrypt (zero deps)            |
| `verifyPassword(password, hash)` | Async Function | Timing-safe verification                |
| `createLogger(options?)`         | Function       | Structured JSON logger factory          |
| `generateRequestId()`            | Function       | UUID v4 request ID                      |
| `extractBearerToken(header)`     | Function       | Extract token from Authorization header |

---

## License

MIT © JohnsCodingLab
