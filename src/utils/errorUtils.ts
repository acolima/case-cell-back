type AppErrorTypes = "conflict" | "not_found" | "validation_error";

export interface AppError {
  type: AppErrorTypes;
  message: string;
}

export function isAppError(error: object): error is AppError {
  return (error as AppError).type !== undefined;
}

export function errorTypeToStatusCode(type: AppErrorTypes) {
  if (type === "not_found") return 404;
  if (type === "conflict") return 409;
  if (type === "validation_error") return 422;
  return 400;
}

export function conflictError(message?: string): AppError {
  return { type: "conflict", message: message ?? "" };
}

export function notFoundError(message?: string): AppError {
  return { type: "not_found", message: message ?? "" };
}

export function validationError(message?: string): AppError {
  return { type: "validation_error", message: message ?? "" };
}
