import type { ErrorCode } from "./error-codes.js";

export interface AppErrorOptions {
  code: ErrorCode;
  message?: string | undefined;
  statusCode?: number;
  metadata?: Record<string, unknown> | undefined;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly metadata?: Record<string, unknown> | undefined;
  readonly cause?: unknown;
  readonly isOperational = true;

  constructor(options: AppErrorOptions) {
    // If no message is provided, we default to the ErrorCode string
    super(options.message ?? options.code);

    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.metadata = options.metadata;
    this.cause = options.cause;

    // This ensures the stack trace starts from where the error was thrown
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}
