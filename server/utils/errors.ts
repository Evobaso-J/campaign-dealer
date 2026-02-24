import { createError } from "h3";
import type { ZodType } from "zod";
import { parseAIJson } from "./parseAIJson";

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

// --- Helpers ---

export async function withAIProvider<T>(
  fn: () => Promise<T>,
): Promise<Result<T, AIProviderError>> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(new AIProviderError("AI service error", { cause: error }));
  }
}

export function parseAndValidateAIResponse<T>(
  raw: string,
  schema: ZodType<T>,
  label: string,
): Result<T, AIResponseError> {
  const parsed = parseAIJson<unknown>(raw);
  if (!parsed.ok) {
    console.error(`[${label}] Failed to parse AI JSON. Raw text:`, raw);
    return err(
      new AIResponseError("AI returned an unparseable response", {
        cause: parsed.error,
      }),
    );
  }

  const result = schema.safeParse(parsed.value);
  if (!result.success) {
    console.error(
      `[${label}] AI output failed schema validation:`,
      result.error.issues,
    );
    return err(new AIResponseError("AI returned an invalid response"));
  }

  return ok(result.data);
}

export function toHttpError(error: AppError): never {
  throw createError({
    statusCode: error.statusCode,
    statusMessage: error.message,
    data: error.data,
  });
}
