import type { AIPrompt } from "~~/server/services/ai/index";
import type { CharacterTemplate } from "~~/server/services/rpg/characterRandomizer";
import { LocaleNames, type Genre, type Locale } from "~~/shared/types/campaign";

const SYSTEM_PROMPT = `You are a creative writing assistant for a tabletop RPG called "The House Doesn't Always Win."
Your task is to generate a character identity for a player character.

In this game, player characters are revolutionaries fighting against an oppressive faction called the Diamonds. The Diamonds control the world and its resources. Each character has joined the cause for a personal reason — they have nothing left to lose and everything to fight for.

You MUST respond with ONLY a valid JSON object matching the CharacterIdentity schema below.
Do not include any text, explanation, or markdown formatting outside of the JSON object.

CharacterIdentity schema:
{
  "name": string (required) — the character's full name or alias, fitting the campaign setting. It doesn't have to match the character's archetype or suit,
  "pronouns": string | undefined — the character's pronouns (e.g. "he/him", "she/her", "they/them"). It doesn't have to match the character's archetype or suit,
  "concept": string (required) — a brief, evocative description of who this character is and why they fight against the Diamonds. Be incisive — imagine describing them to a friend in one sentence,
  "weapon": { "name": string, "concealed": boolean } | undefined — the character's signature weapon. If the item is not self-explanatory, describe its function,
  "instrument": { "name": string, "concealed": boolean } | undefined — the character's signature instrument or tool. If the item is not self-explanatory, describe its function,
}

Guidelines:
- The name, weapon, and instrument must be thematically appropriate for the campaign setting.
- The concept should reflect the character's archetype and suit personality, as well as their motivation to rebel against the Diamonds.
- Weapon and instrument must be realistically available to underdogs and revolutionaries — not elite military hardware or rare artifacts unless the setting justifies it. Consider what someone in their position could actually obtain.
- The "concealed" field indicates whether the item is small or subtle enough to be hidden on the character's person. A knife or lockpick can be concealed; a rifle or a ladder cannot.
- If a weapon or instrument is not appropriate for the character, set the field to undefined.`;

export function buildCharacterPrompt({
  template,
  setting,
  language,
}: {
  template: CharacterTemplate;
  setting: Genre[];
  language: Locale;
}): AIPrompt {
  const user = `Generate a CharacterIdentity for this character:

Archetype: ${template.archetype}
${template.archetypeCharacterization}

Suit: ${template.suit}
${template.suitCharacterization}

Campaign setting: ${setting.join(", ")}

Language: ${LocaleNames[language]}
All generated text must be written in ${LocaleNames[language]}.`;

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
