import { createError, defineEventHandler, isError, readBody } from "h3";
import "~~/server/services/ai/anthropic";
import "~~/server/services/ai/ollama";
import { getAIProvider } from "~~/server/services/ai/index";
import { buildScriptPrompt } from "~~/server/services/ai/prompts/script";
import { parseAIJson } from "~~/server/utils/parseAIJson";
import {
  gameMasterScriptSchema,
  scriptRequestSchema,
} from "~~/server/utils/validate";
import type { GameMasterScript } from "~~/shared/types/campaign";

export default defineEventHandler(async (event): Promise<GameMasterScript> => {
  const body = await readBody(event);
  const parsed = scriptRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: parsed.error.issues,
    });
  }

  const { characters, setting, language } = parsed.data;

  let provider: ReturnType<typeof getAIProvider>;
  try {
    provider = getAIProvider();
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "AI provider is not configured",
    });
  }

  try {
    const prompt = buildScriptPrompt({ characters, setting, language });

    let result: Awaited<ReturnType<typeof provider.complete>>;
    try {
      result = await provider.complete(prompt);
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: "AI service error",
      });
    }

    let rawScript: unknown;
    try {
      rawScript = parseAIJson<unknown>(result.text);
    } catch {
      console.error("[script] Failed to parse AI JSON. Raw text:", result.text);
      throw createError({
        statusCode: 502,
        statusMessage: "AI returned an unparseable response",
      });
    }

    const scriptResult = gameMasterScriptSchema.safeParse(rawScript);
    if (!scriptResult.success) {
      console.error(
        "[script] AI output failed schema validation:",
        scriptResult.error.issues,
      );
      throw createError({
        statusCode: 502,
        statusMessage: "AI returned an invalid response",
      });
    }

    return scriptResult.data;
  } catch (error) {
    if (isError(error)) throw error;
    throw error;
  }
});
