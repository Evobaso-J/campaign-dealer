import type { GeneratedText, I18nKey } from "./utils";

type CharacterArchetype = "king" | "queen" | "jack";
export type CharacterSuit = "hearts" | "clubs" | "spades"; // diamonds exluded. In "The house doesn't always win", diamonds are the bad guys, so they are not a valid suit for the characters.
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
  suitSkill: CharacterSkill; // TODO: create enum based on the suit-archetype combinations
  characterIdentity: CharacterIdentity;
  skills: CharacterSkill[]; // TODO: create enum based on the archetype skills
}
