// ── Types ────────────────────────────────────────────────

export interface PaginationParams {
    /** Current page number (1-indexed) */
    page: number;
    /** Number of items per page */
    limit: number;
    /** Total number of items across all pages */
    total: number;
}

export interface PaginationMeta {
    /** Current page number */
    page: number;
    /** Items per page */
    limit: number;
    /** Total items across all pages */
    total: number;
    /** Total number of pages */
    totalPages: number;
    /** Offset for database queries (e.g. SQL OFFSET) */
    offset: number;
    /** Whether there is a next page */
    hasNext: boolean;
    /** Whether there is a previous page */
    hasPrev: boolean;
}

// ── Function ─────────────────────────────────────────────

/**
 * Calculate pagination metadata from page, limit, and total count.
 *
 * @example
 * ```ts
 * const meta = paginate({ page: 2, limit: 20, total: 95 });
 * // → { page: 2, limit: 20, total: 95, totalPages: 5, offset: 20, hasNext: true, hasPrev: true }
 *
 * // Use in a DB query:
 * const users = await db.query("SELECT * FROM users LIMIT $1 OFFSET $2", [meta.limit, meta.offset]);
 * ```
 */
export function paginate(params: PaginationParams): PaginationMeta {
    const page = Math.max(1, Math.floor(params.page));
    const limit = Math.max(1, Math.floor(params.limit));
    const total = Math.max(0, Math.floor(params.total));

    const totalPages = Math.ceil(total / limit) || 1;
    const clampedPage = Math.min(page, totalPages);
    const offset = (clampedPage - 1) * limit;

    return {
        page: clampedPage,
        limit,
        total,
        totalPages,
        offset,
        hasNext: clampedPage < totalPages,
        hasPrev: clampedPage > 1,
    };
}
