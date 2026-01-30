import { AppError } from "./app-error.js";

export function serializeError(error: unknown) {
  if (error instanceof AppError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      metadata: error.metadata,
    };
  }

  return {
    name: "InternalError",
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}
