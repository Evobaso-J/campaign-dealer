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
  const body = await readBody(event);
  const parsed = charactersRequestSchema.safeParse(body);
  if (!parsed.success) {
    toHttpError(new ValidationError("Validation failed", parsed.error.issues));
  }

  const { playerCount, setting, language } = parsed.data;

  const templates = generateRandomDistinctCharacters(playerCount);
  if (!templates.ok) toHttpError(templates.error);

  const provider = getAIProvider();
  if (!provider.ok) toHttpError(provider.error);

  return Promise.all(
    templates.value.map(async (template) => {
      const prompt = buildCharacterPrompt({ template, setting, language });
      const result = await withAIProvider(() => provider.value.complete(prompt));
      if (!result.ok) toHttpError(result.error);

      const identity = parseAndValidateAIResponse(
        result.value.text,
        characterIdentitySchema,
        "characters",
      );
      if (!identity.ok) toHttpError(identity.error);

      return {
        archetype: template.archetype,
        suit: template.suit,
        damage: template.damage,
        modifiers: template.modifiers,
        suitSkill: template.suitSkill,
        archetypeSkills: template.archetypeSkills,
        characterIdentity: identity.value,
      };
    }),
  );
});
