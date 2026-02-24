import { createError } from "h3";
import type { ZodType } from "zod";
import { parseAIJson } from "./parseAIJson";

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

export async function withAIProvider<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new AIProviderError("AI service error", {
      cause: error,
    });
  }
}

export function parseAndValidateAIResponse<T>(
  raw: string,
  schema: ZodType<T>,
  label: string,
): T {
  let parsed: unknown;
  try {
    parsed = parseAIJson<unknown>(raw);
  } catch (cause) {
    console.error(`[${label}] Failed to parse AI JSON. Raw text:`, raw);
    throw new AIResponseError("AI returned an unparseable response", { cause });
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(
      `[${label}] AI output failed schema validation:`,
      result.error.issues,
    );
    throw new AIResponseError("AI returned an invalid response");
  }

  return result.data;
}

export function toHttpError(error: unknown): never {
  if (error instanceof AppError) {
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
      data: error.data,
    });
  }
  throw error;
}
