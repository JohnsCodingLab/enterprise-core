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
