import { serializeError } from "../errors/serialize-error.js";
import type { SerializedError } from "../errors/serialize-error.js";
import type { PaginationMeta } from "./pagination.js";

// ── Types ────────────────────────────────────────────────

export interface SuccessResponse<T> {
    success: true;
    data: T;
    meta?: PaginationMeta | undefined;
}

export interface ErrorResponse {
    success: false;
    error: SerializedError;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ── Functions ────────────────────────────────────────────

/**
 * Wrap data in a success response envelope.
 *
 * @example
 * ```ts
 * // Simple response
 * res.json(success({ id: "123", name: "John" }));
 * // → { success: true, data: { id: "123", name: "John" } }
 *
 * // With pagination meta
 * res.json(success(users, paginationMeta));
 * // → { success: true, data: [...], meta: { page: 1, ... } }
 * ```
 */
export function success<T>(data: T, meta?: PaginationMeta): SuccessResponse<T> {
    if (meta) {
        return { success: true, data, meta };
    }
    return { success: true, data };
}

/**
 * Wrap an error in an error response envelope.
 * Accepts any error — AppError subclasses get full serialization,
 * unknown errors get a safe "Internal Error" message.
 *
 * @example
 * ```ts
 * try {
 *   // ...
 * } catch (err) {
 *   const envelope = error(err);
 *   res.status(envelope.error.statusCode).json(envelope);
 * }
 * ```
 */
export function error(
    err: unknown,
    options?: { includeStack?: boolean },
): ErrorResponse {
    return {
        success: false,
        error: serializeError(err, options),
    };
}
