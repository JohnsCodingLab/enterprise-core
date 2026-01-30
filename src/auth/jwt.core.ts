// src/auth/jwt.core.ts

import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { AuthError } from "../errors/auth-error.js";

export interface SignJwtOptions {
  secret: string;
  expiresIn: string | number;
  issuer?: string | undefined;
  audience?: string | undefined;
  algorithm?: "HS256" | "HS384" | "HS512";
}

export interface VerifyJwtOptions {
  secret: string;
  issuer?: string | undefined;
  audience?: string | undefined;
}

export function signJWT<T extends object>(
  payload: T,
  options: SignJwtOptions,
): string {
  try {
    const signOptions: SignOptions = {
      expiresIn: options.expiresIn as any,
      issuer: options.issuer,
      audience: options.audience,
      algorithm: options.algorithm ?? "HS256",
    };

    return jwt.sign(payload, options.secret, signOptions);
  } catch {
    throw new AuthError("TOKEN_INVALID");
  }
}

export function verifyJWT<T = unknown>(
  token: string,
  options: VerifyJwtOptions,
): T {
  try {
    return jwt.verify(token, options.secret, {
      issuer: options.issuer,
      audience: options.audience,
    }) as T;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AuthError("TOKEN_EXPIRED");
    }
    throw new AuthError("TOKEN_INVALID");
  }
}
