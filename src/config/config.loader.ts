import type { AppConfig } from "./config.types.js";
import { requireString } from "./config.schema.js";

export function loadConfig(env: Record<string, unknown>): AppConfig {
  return {
    auth: {
      jwt: {
        accessTokenSecret: requireString(env, "JWT_ACCESS_SECRET"),
        refreshTokenSecret: requireString(env, "JWT_REFRESH_SECRET"),
        accessTokenTtl: requireString(env, "JWT_ACCESS_TTL"),
        refreshTokenTtl: requireString(env, "JWT_REFRESH_TTL"),
      },
    },
  };
}
