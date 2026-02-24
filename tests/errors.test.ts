import { describe, it, expect } from "vitest";
import {
  AppError,
  AuthError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitedError,
  serializeError,
} from "../src/index.js";

// ── AppError ──────────────────────────────────────────────

describe("AppError", () => {
  it("should create an error with all options", () => {
    const err = new AppError({
      code: "VALIDATION_ERROR",
      message: "Name is required",
      statusCode: 422,
      metadata: { field: "name" },
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Name is required");
    expect(err.statusCode).toBe(422);
    expect(err.metadata).toEqual({ field: "name" });
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe("AppError");
  });

  it("should default message to code", () => {
    const err = new AppError({ code: "INTERNAL_ERROR" });
    expect(err.message).toBe("INTERNAL_ERROR");
  });

  it("should default statusCode to 500", () => {
    const err = new AppError({ code: "INTERNAL_ERROR" });
    expect(err.statusCode).toBe(500);
  });
});

// ── AuthError ─────────────────────────────────────────────

describe("AuthError", () => {
  it("should always use 401 status code", () => {
    const err = new AuthError("TOKEN_EXPIRED");
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("TOKEN_EXPIRED");
    expect(err.name).toBe("AuthError");
  });
});

// ── HttpError Subclasses ──────────────────────────────────

describe("HttpError subclasses", () => {
  it("BadRequestError → 400", () => {
    const err = new BadRequestError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Bad Request");
  });

  it("BadRequestError with custom message and metadata", () => {
    const err = new BadRequestError("Invalid email", { field: "email" });
    expect(err.message).toBe("Invalid email");
    expect(err.metadata).toEqual({ field: "email" });
  });

  it("UnauthorizedError → 401", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("ForbiddenError → 403", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("NotFoundError → 404", () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("ConflictError → 409", () => {
    const err = new ConflictError("User already exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
    expect(err.message).toBe("User already exists");
  });

  it("RateLimitedError → 429", () => {
    const err = new RateLimitedError("Slow down", 60);
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.metadata).toEqual({ retryAfterSeconds: 60 });
  });
});

// ── serializeError ────────────────────────────────────────

describe("serializeError", () => {
  it("should serialize an AppError", () => {
    const err = new NotFoundError("User not found");
    const serialized = serializeError(err);

    expect(serialized).toEqual({
      name: "NotFoundError",
      code: "NOT_FOUND",
      message: "User not found",
      statusCode: 404,
      metadata: undefined,
    });
  });

  it("should serialize an unknown error as InternalError", () => {
    const serialized = serializeError(new TypeError("oops"));

    expect(serialized.code).toBe("INTERNAL_ERROR");
    expect(serialized.statusCode).toBe(500);
    expect(serialized.message).toBe("An unexpected error occurred");
  });

  it("should include stack trace when includeStack is true", () => {
    const err = new AppError({ code: "INTERNAL_ERROR" });
    const serialized = serializeError(err, { includeStack: true });

    expect(serialized.stack).toBeDefined();
    expect(serialized.stack).toContain("AppError");
  });

  it("should include stack for unknown errors when includeStack is true", () => {
    const serialized = serializeError(new Error("boom"), {
      includeStack: true,
    });
    expect(serialized.stack).toBeDefined();
  });

  it("should not include stack by default", () => {
    const err = new AppError({ code: "INTERNAL_ERROR" });
    const serialized = serializeError(err);

    expect(serialized.stack).toBeUndefined();
  });
});
