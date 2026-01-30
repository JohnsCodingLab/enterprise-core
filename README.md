# @JohnsCodingLab/enterprise-core

Enterprise-grade, framework-agnostic core utilities for Node.js backend development.

## Why this package?

Modern backend teams rewrite the same logic repeatedly:

- JWT authentication
- Error handling
- Environment configuration
- Authorization guards

This package provides **secure defaults**, **clean APIs**, and **TypeScript-first tooling** without locking you into any framework.

## Features (v1)

- 🔐 JWT authentication utilities
- 🚨 Standardized error handling
- ⚙️ Typed environment configuration
- 🧱 Framework-agnostic guards
- 🧪 Fully typed & tested

## Installation

```bash
npm install @JohnsCodingLab/enterprise-core
```

## 🔐 Authentication

The `@johnscodinglab/enterprise-core` auth module provides a high-level factory to manage JWT lifecycles with built-in error handling.

### Basic Usage

```typescript
import { createAuth } from "@johnscodinglab/enterprise-core";

const auth = createAuth({
  jwtSecret: process.env.JWT_SECRET,
  issuer: "my-api-service",
  accessTokenExpiry: "1h",
});

// Issuing a token
const token = auth.issueAccessToken({ userId: "user_123", role: "admin" });

// Verifying a token
try {
  const payload = auth.verifyAccessToken(token);
  console.log(payload.userId);
} catch (error) {
  // Automatically throws AuthError with codes like 'TOKEN_EXPIRED'
}
```
