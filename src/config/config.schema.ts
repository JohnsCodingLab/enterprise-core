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

export function requireNumber(
  env: Record<string, unknown>,
  key: string,
): number {
  const raw = env[key];

  if (raw === undefined || raw === null || raw === "") {
    throw new ConfigError(`Missing env var: ${key}`);
  }

  const value = Number(raw);

  if (Number.isNaN(value)) {
    throw new ConfigError(
      `Invalid number for env var: ${key} (got "${String(raw)}")`,
    );
  }

  return value;
}

export function requireBoolean(
  env: Record<string, unknown>,
  key: string,
): boolean {
  const raw = env[key];

  if (typeof raw === "boolean") return raw;

  if (typeof raw === "string") {
    if (raw.toLowerCase() === "true") return true;
    if (raw.toLowerCase() === "false") return false;
  }

  throw new ConfigError(
    `Invalid boolean for env var: ${key} (expected "true" or "false", got "${String(raw)}")`,
  );
}

export function optionalString(
  env: Record<string, unknown>,
  key: string,
  defaultValue: string,
): string {
  const value = env[key];

  if (!value || typeof value !== "string") {
    return defaultValue;
  }

  return value;
}

export function optionalNumber(
  env: Record<string, unknown>,
  key: string,
  defaultValue: number,
): number {
  const raw = env[key];

  if (raw === undefined || raw === null || raw === "") {
    return defaultValue;
  }

  const value = Number(raw);

  if (Number.isNaN(value)) {
    return defaultValue;
  }

  return value;
}
