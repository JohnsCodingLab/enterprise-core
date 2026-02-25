import { describe, it, expect } from "vitest";
import { paginate } from "../src/index.js";

describe("paginate", () => {
    it("should calculate basic pagination", () => {
        const meta = paginate({ page: 2, limit: 20, total: 95 });

        expect(meta.page).toBe(2);
        expect(meta.limit).toBe(20);
        expect(meta.total).toBe(95);
        expect(meta.totalPages).toBe(5);
        expect(meta.offset).toBe(20);
        expect(meta.hasNext).toBe(true);
        expect(meta.hasPrev).toBe(true);
    });

    it("should handle first page", () => {
        const meta = paginate({ page: 1, limit: 10, total: 50 });

        expect(meta.page).toBe(1);
        expect(meta.offset).toBe(0);
        expect(meta.hasNext).toBe(true);
        expect(meta.hasPrev).toBe(false);
    });

    it("should handle last page", () => {
        const meta = paginate({ page: 5, limit: 10, total: 50 });

        expect(meta.page).toBe(5);
        expect(meta.offset).toBe(40);
        expect(meta.hasNext).toBe(false);
        expect(meta.hasPrev).toBe(true);
    });

    it("should handle single page", () => {
        const meta = paginate({ page: 1, limit: 10, total: 5 });

        expect(meta.totalPages).toBe(1);
        expect(meta.hasNext).toBe(false);
        expect(meta.hasPrev).toBe(false);
    });

    it("should handle empty results", () => {
        const meta = paginate({ page: 1, limit: 10, total: 0 });

        expect(meta.totalPages).toBe(1);
        expect(meta.total).toBe(0);
        expect(meta.offset).toBe(0);
        expect(meta.hasNext).toBe(false);
        expect(meta.hasPrev).toBe(false);
    });

    it("should clamp page to max", () => {
        const meta = paginate({ page: 100, limit: 10, total: 30 });

        expect(meta.page).toBe(3); // max page
        expect(meta.offset).toBe(20);
    });

    it("should clamp page minimum to 1", () => {
        const meta = paginate({ page: 0, limit: 10, total: 30 });

        expect(meta.page).toBe(1);
        expect(meta.offset).toBe(0);
    });

    it("should clamp limit minimum to 1", () => {
        const meta = paginate({ page: 1, limit: 0, total: 30 });

        expect(meta.limit).toBe(1);
        expect(meta.totalPages).toBe(30);
    });
});
