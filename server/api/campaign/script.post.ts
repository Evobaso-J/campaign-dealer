import { defineEventHandler, readBody } from "h3";
import "~~/server/services/ai/anthropic";
import "~~/server/services/ai/ollama";
import { getAIProvider } from "~~/server/services/ai/index";
import { buildScriptPrompt } from "~~/server/services/ai/prompts/script";
import {
  ValidationError,
  withAIProvider,
  parseAndValidateAIResponse,
  toHttpError,
} from "~~/server/utils/errors";
import {
  gameMasterScriptSchema,
  scriptRequestSchema,
} from "~~/server/utils/validate";
import type { GameMasterScript } from "~~/shared/types/campaign";

export default defineEventHandler(async (event): Promise<GameMasterScript> => {
  try {
    const body = await readBody(event);
    const parsed = scriptRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const { characters, setting, language } = parsed.data;
    const provider = getAIProvider();
    const prompt = buildScriptPrompt({ characters, setting, language });
    const result = await withAIProvider(() => provider.complete(prompt));

    return parseAndValidateAIResponse(
      result.text,
      gameMasterScriptSchema,
      "script",
    );
  } catch (error) {
    toHttpError(error);
  }
});
