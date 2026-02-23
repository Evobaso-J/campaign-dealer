import type { AIPrompt } from "~~/server/services/ai/index";
import type { CharacterTemplate } from "~~/server/services/rpg/characterRandomizer";

const SYSTEM_PROMPT = `You are a creative writing assistant for a tabletop RPG called "The House Doesn't Always Win."
Your task is to generate a character identity for a player character.

You MUST respond with ONLY a valid JSON object matching the CharacterIdentity schema below.
Do not include any text, explanation, or markdown formatting outside of the JSON object.

CharacterIdentity schema:
{
  "name": string (required) — the character's full name, fitting the campaign setting,
  "pronouns": string | null — the character's pronouns (e.g. "he/him", "she/her", "they/them"),
  "concept": string | null — a one-sentence description of who this character is,
  "weapon": { "name": string, "concealed": boolean } | null — the character's signature weapon,
  "instrument": { "name": string, "concealed": boolean } | null — the character's signature instrument or tool
}

Guidelines:
- The name, weapon, and instrument must be thematically appropriate for the campaign setting.
- The concept should reflect the character's archetype and suit personality.
- The "concealed" field indicates whether the item is hidden on the character's person.
- If a weapon or instrument is not appropriate for the character, set the field to null.`;

export function buildCharacterPrompt(
  template: CharacterTemplate,
  setting: string,
): AIPrompt {
  const user = `Generate a CharacterIdentity for this character:

Archetype: ${template.archetype}
${template.archetypeCharacterization}

Suit: ${template.suit}
${template.suitCharacterization}

Campaign setting: ${setting}`;

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
