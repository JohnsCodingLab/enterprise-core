import { AppError } from "./app-error.js";
import type { ErrorCode } from "./error-codes.js";

export class HttpError extends AppError {
  constructor(
    code: ErrorCode,
    statusCode: number,
    message?: string,
    metadata?: Record<string, unknown>,
  ) {
    super({
      code,
      statusCode,
      message,
      metadata,
    });
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad Request", metadata?: Record<string, unknown>) {
    super("BAD_REQUEST", 400, message, metadata);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", 401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", 403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not Found") {
    super("NOT_FOUND", 404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict", metadata?: Record<string, unknown>) {
    super("CONFLICT", 409, message, metadata);
  }
}

export class RateLimitedError extends HttpError {
  constructor(message = "Too Many Requests", retryAfterSeconds?: number) {
    super(
      "RATE_LIMITED",
      429,
      message,
      retryAfterSeconds ? { retryAfterSeconds } : undefined,
    );
  }
}
