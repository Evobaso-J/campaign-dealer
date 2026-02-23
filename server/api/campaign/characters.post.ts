import { getAIProvider } from "~~/server/services/ai/index";
import { buildCharacterPrompt } from "~~/server/services/ai/prompts/character";
import { generateRandomDistinctCharacters } from "~~/server/services/rpg/characterRandomizer";
import { parseAIJson } from "~~/server/utils/parseAIJson";
import { charactersRequestSchema } from "~~/server/utils/validate";
import type { CharacterSheet } from "~~/shared/types/character";

export default defineEventHandler(async (event) => {
  // 1. Validate request body
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

  // 2. Generate random character templates
  let templates;
  try {
    templates = generateRandomDistinctCharacters(playerCount);
  } catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage:
        error instanceof Error ? error.message : "Invalid player count",
    });
  }

  // 3. Generate character identities via AI (in parallel)
  let provider;
  try {
    provider = getAIProvider();
  } catch (error) {
    console.error("AI provider configuration error:", error);
    throw createError({
      statusCode: 502,
      statusMessage: "AI provider is not configured",
    });
  }

  try {
    const characterSheets: CharacterSheet[] = await Promise.all(
      templates.map(async (template) => {
        const prompt = buildCharacterPrompt(template, setting);
        const result = await provider.complete(prompt);

        let identity;
        try {
          identity = parseAIJson<CharacterSheet["characterIdentity"]>(
            result.text,
          );
        } catch {
          console.error(
            "AI returned unparseable JSON for character identity:",
            result.text,
          );
          throw createError({
            statusCode: 502,
            statusMessage: "AI returned an unparseable response",
          });
        }

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
    // Re-throw errors already wrapped with createError
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Unexpected error during character generation:", error);
    throw createError({
      statusCode: 502,
      statusMessage: "AI service error",
    });
  }
});
