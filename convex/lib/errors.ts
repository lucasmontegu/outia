/**
 * Typed error codes for the application.
 */

export class AppError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AppError";
  }
}

export type ErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "API_ERROR"
  | "BUDGET_EXCEEDED"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE";

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
