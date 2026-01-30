import { ConfigError } from "./config.error.js";

export function requireString(
  env: Record<string, unknown>,
  key: string,
): string {
  const value = env[key];

  if (!value || typeof value !== "string") {
    throw new ConfigError(`Missing or invalid env var: ${key}`);
  }

  return value;
}
