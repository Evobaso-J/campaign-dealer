// --- Result type ---

export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// --- Error classes ---

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 422, data);
    this.name = "ValidationError";
  }
}

export class AIProviderError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 502, undefined, options);
    this.name = "AIProviderError";
  }
}

export class AIResponseError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 502, undefined, options);
    this.name = "AIResponseError";
  }
}
