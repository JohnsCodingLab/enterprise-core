import { AppError } from "./app-error.js";
import type { ErrorCode } from "./error-codes.js";

export class AuthError extends AppError {
  constructor(
    code: Extract<
      ErrorCode,
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "TOKEN_EXPIRED"
      | "TOKEN_INVALID"
      | "TOKEN_MISSING"
    >,
  ) {
    super({
      code,
      statusCode: 401,
    });
  }
}
