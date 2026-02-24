import type { AppConfig } from "./config.types.js";
import {
  requireString,
  requireNumber,
  optionalString,
} from "./config.schema.js";

/**
 * Generic config loader factory — define your own config shape
 * by providing a builder function that uses schema validators.
 *
 * @example
 * ```ts
 * const loadMyConfig = createConfigLoader((env) => ({
 *   dbUrl: requireString(env, "DATABASE_URL"),
 *   port: requireNumber(env, "PORT"),
 * }));
 *
 * const config = loadMyConfig(process.env);
 * ```
 */
export function createConfigLoader<T>(
  builder: (env: Record<string, unknown>) => T,
): (env: Record<string, unknown>) => T {
  return (env: Record<string, unknown>) => builder(env);
}

/**
 * Default config loader for the built-in AppConfig shape.
 * Reads common auth + server env vars.
 */
export function loadConfig(env: Record<string, unknown>): AppConfig {
  return {
    auth: {
      jwt: {
        accessTokenSecret: requireString(env, "JWT_ACCESS_SECRET"),
        refreshTokenSecret: requireString(env, "JWT_REFRESH_SECRET"),
        accessTokenTtl: optionalString(env, "JWT_ACCESS_TTL", "15m"),
        refreshTokenTtl: optionalString(env, "JWT_REFRESH_TTL", "7d"),
      },
    },
    server: {
      port: requireNumber(env, "PORT"),
      nodeEnv: optionalString(
        env,
        "NODE_ENV",
        "development",
      ) as AppConfig["server"]["nodeEnv"],
    },
  };
}
