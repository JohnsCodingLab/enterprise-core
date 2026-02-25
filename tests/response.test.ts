import { describe, it, expect } from "vitest";
import { success, error, NotFoundError, paginate } from "../src/index.js";

describe("success", () => {
    it("should wrap data in a success envelope", () => {
        const result = success({ id: "123", name: "John" });

        expect(result).toEqual({
            success: true,
            data: { id: "123", name: "John" },
        });
    });

    it("should include pagination meta when provided", () => {
        const meta = paginate({ page: 1, limit: 10, total: 50 });
        const result = success([{ id: "1" }, { id: "2" }], meta);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.meta).toBeDefined();
        expect(result.meta!.totalPages).toBe(5);
    });

    it("should not include meta key when no meta provided", () => {
        const result = success("hello");

        expect(result).toEqual({ success: true, data: "hello" });
        expect("meta" in result).toBe(false);
    });
});

describe("error", () => {
    it("should wrap an AppError in an error envelope", () => {
        const result = error(new NotFoundError("User not found"));

        expect(result.success).toBe(false);
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.statusCode).toBe(404);
        expect(result.error.message).toBe("User not found");
    });

    it("should wrap an unknown error safely", () => {
        const result = error(new TypeError("oops"));

        expect(result.success).toBe(false);
        expect(result.error.code).toBe("INTERNAL_ERROR");
        expect(result.error.statusCode).toBe(500);
        expect(result.error.message).toBe("An unexpected error occurred");
    });

    it("should include stack when requested", () => {
        const result = error(new NotFoundError("nope"), { includeStack: true });

        expect(result.error.stack).toBeDefined();
    });
});
