import { AppError } from "../errors/app-error.js";

export class ConfigError extends AppError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super({
      code: "VALIDATION_ERROR",
      statusCode: 500,
      message,
      metadata,
    });
  }
}
