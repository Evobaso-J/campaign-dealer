import { createError } from "h3";
import type { ZodType } from "zod";
import { parseAIJson } from "./parseAIJson";
import {
  ok,
  err,
  AIProviderError,
  AIResponseError,
  type Result,
  type AppError,
} from "~~/shared/types/errors";

// --- Server-only helpers ---

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
