import { defineEventHandler, readBody } from "h3";
import "~~/server/services/ai/anthropic";
import "~~/server/services/ai/ollama";
import { getAIProvider } from "~~/server/services/ai/index";
import { buildCharacterPrompt } from "~~/server/services/ai/prompts/character";
import { generateRandomDistinctCharacters } from "~~/server/services/rpg/characterRandomizer";
import {
  ValidationError,
  withAIProvider,
  parseAndValidateAIResponse,
  toHttpError,
} from "~~/server/utils/errors";
import {
  characterIdentitySchema,
  charactersRequestSchema,
} from "~~/server/utils/validate";
import type { CharacterSheet } from "~~/shared/types/character";

export default defineEventHandler(async (event): Promise<CharacterSheet[]> => {
  try {
    const body = await readBody(event);
    const parsed = charactersRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const { playerCount, setting, language } = parsed.data;
    const templates = generateRandomDistinctCharacters(playerCount);
    const provider = getAIProvider();

    const characterSheets: CharacterSheet[] = await Promise.all(
      templates.map(async (template) => {
        const prompt = buildCharacterPrompt({ template, setting, language });
        const result = await withAIProvider(() => provider.complete(prompt));
        const identity = parseAndValidateAIResponse(
          result.text,
          characterIdentitySchema,
          "characters",
        );

        return {
          archetype: template.archetype,
          suit: template.suit,
          damage: template.damage,
          modifiers: template.modifiers,
          suitSkill: template.suitSkill,
          archetypeSkills: template.archetypeSkills,
          characterIdentity: identity,
        };
      }),
    );

    return characterSheets;
  } catch (error) {
    toHttpError(error);
  }
});
