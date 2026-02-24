import { createError, defineEventHandler, isError, readBody } from "h3";
import "~~/server/services/ai/anthropic";
import "~~/server/services/ai/ollama";
import { getAIProvider } from "~~/server/services/ai/index";
import { buildCharacterPrompt } from "~~/server/services/ai/prompts/character";
import { generateRandomDistinctCharacters } from "~~/server/services/rpg/characterRandomizer";
import { parseAIJson } from "~~/server/utils/parseAIJson";
import {
  characterIdentitySchema,
  charactersRequestSchema,
} from "~~/server/utils/validate";
import type { CharacterSheet } from "~~/shared/types/character";

export default defineEventHandler(async (event): Promise<CharacterSheet[]> => {
  const body = await readBody(event);
  const parsed = charactersRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: parsed.error.issues,
    });
  }

  const { playerCount, setting } = parsed.data;

  let templates: ReturnType<typeof generateRandomDistinctCharacters>;
  try {
    templates = generateRandomDistinctCharacters(playerCount);
  } catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage:
        error instanceof Error ? error.message : "Invalid player count",
    });
  }

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
    const characterSheets: CharacterSheet[] = await Promise.all(
      templates.map(async (template) => {
        const prompt = buildCharacterPrompt(template, setting);

        let result: Awaited<ReturnType<typeof provider.complete>>;
        try {
          result = await provider.complete(prompt);
        } catch {
          throw createError({
            statusCode: 502,
            statusMessage: "AI service error",
          });
        }

        let rawIdentity: unknown;
        try {
          rawIdentity = parseAIJson<unknown>(result.text);
        } catch {
          console.error(
            "[characters] Failed to parse AI JSON. Raw text:",
            result.text,
          );
          throw createError({
            statusCode: 502,
            statusMessage: "AI returned an unparseable response",
          });
        }

        const identityResult = characterIdentitySchema.safeParse(rawIdentity);
        if (!identityResult.success) {
          console.error(
            "[characters] AI output failed schema validation:",
            identityResult.error.issues,
          );
          throw createError({
            statusCode: 502,
            statusMessage: "AI returned an invalid response",
          });
        }

        return {
          archetype: template.archetype,
          suit: template.suit,
          damage: template.damage,
          modifiers: template.modifiers,
          suitSkill: template.suitSkill,
          archetypeSkills: template.archetypeSkills,
          characterIdentity: identityResult.data,
        };
      }),
    );

    return characterSheets;
  } catch (error) {
    if (isError(error)) throw error;
    throw error;
  }
});
