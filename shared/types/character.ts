import type { GeneratedText, I18nKey } from "./utils";

export const CharacterArchetype = {
  king: "king",
  queen: "queen",
  jack: "jack",
} as const;

export type CharacterArchetype =
  (typeof CharacterArchetype)[keyof typeof CharacterArchetype];

/**
 * Diamonds excluded.
 * In "The house doesn't always win", diamonds are the bad guys,
 * so they are not a valid suit for the characters.
 */
export const CharacterSuit = {
  hearts: "hearts",
  clubs: "clubs",
  spades: "spades",
} as const;

export type CharacterSuit = (typeof CharacterSuit)[keyof typeof CharacterSuit];
type StatModifier = -2 | -1 | 0 | 1 | 2;

interface CharacterItem {
  name: GeneratedText;
  concealed: boolean;
}
interface CharacterIdentity {
  name: GeneratedText;
  pronouns?: GeneratedText;
  concept?: GeneratedText; // Who is this character? A brief description of their personality, background, or role in the story.
  weapon?: CharacterItem;
  instrument?: CharacterItem;
}

export interface CharacterSkill {
  name: I18nKey;
  description: I18nKey;
  uses?: {
    usesLeft: number;
    maxUses: number;
  };
}
export interface CharacterSheet {
  archetype: CharacterArchetype;
  suit: CharacterSuit;
  damage: { [suit in CharacterSuit]: boolean };
  modifiers: { [stat in CharacterSuit]: StatModifier };
  suitSkill: CharacterSkill; // A complete list of character skills is included in ~/server/data/houseDoesntWin/characterTemplates.ts
  characterIdentity: CharacterIdentity;
  archetypeSkills: CharacterSkill[]; // A complete list of archetype skills is included in ~/server/data/houseDoesntWin/characterTemplates.ts
}
