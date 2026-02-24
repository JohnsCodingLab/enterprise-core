import { AppError } from "./app-error.js";

export interface SerializedError {
  name: string;
  code: string;
  message: string;
  statusCode: number;
  metadata?: Record<string, unknown> | undefined;
  stack?: string | undefined;
}

export function serializeError(
  error: unknown,
  options?: { includeStack?: boolean },
): SerializedError {
  if (error instanceof AppError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      metadata: error.metadata,
      ...(options?.includeStack ? { stack: error.stack } : {}),
    };
  }

  const fallback: SerializedError = {
    name: "InternalError",
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  };

  if (options?.includeStack && error instanceof Error) {
    fallback.stack = error.stack;
  }

  return fallback;
}
