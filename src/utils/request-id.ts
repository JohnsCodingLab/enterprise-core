import { randomUUID } from "node:crypto";

/**
 * Generate a unique request ID using crypto.randomUUID.
 * Useful for request tracing and correlation across services.
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Extract a Bearer token from an Authorization header value.
 * Returns null if the header is missing or not in the expected format.
 *
 * @example
 * ```ts
 * extractBearerToken("Bearer eyJhbGci..."); // → "eyJhbGci..."
 * extractBearerToken("Basic abc123");        // → null
 * extractBearerToken(undefined);             // → null
 * ```
 */
export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;

  const parts = header.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return null;
  }

  return parts[1];
}
