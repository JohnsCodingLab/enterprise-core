// src/auth/auth.factory.ts

import { AuthError } from "../errors/auth-error.js";
import { signJWT, verifyJWT } from "./jwt.core.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "./types.js";

export interface AuthConfig {
  jwtSecret: string;
  accessTokenExpiry?: string; // default: 15m
  refreshTokenExpiry?: string; // default: 7d
  issuer?: string; // default: app-name
  audience?: string;
}

export function createAuth(config: AuthConfig) {
  if (!config.jwtSecret) {
    throw new Error("jwtSecret is required");
  }

  const {
    jwtSecret,
    accessTokenExpiry = "15m",
    refreshTokenExpiry = "7d",
    issuer = "enterprise-core",
    audience,
  } = config;

  return {
    issueAccessToken(payload: AccessTokenPayload): string {
      return signJWT(payload, {
        secret: jwtSecret,
        expiresIn: accessTokenExpiry,
        issuer,
        audience,
      });
    },

    issueRefreshToken(payload: RefreshTokenPayload): string {
      return signJWT(payload, {
        secret: jwtSecret,
        expiresIn: refreshTokenExpiry,
        issuer,
        audience,
      });
    },

    verifyAccessToken(token: string): AccessTokenPayload {
      if (!token) {
        throw new AuthError("TOKEN_MISSING");
      }

      return verifyJWT<AccessTokenPayload>(token, {
        secret: jwtSecret,
        issuer,
        audience,
      });
    },
  };
}
