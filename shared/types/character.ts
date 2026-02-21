type CharacterArchetype = "king" | "queen" | "jack";
export type CharacterSuit = "hearts" | "clubs" | "spades"; // diamonds exluded. In "The house doesn't always win", diamonds are the bad guys, so they are not a valid suit for the characters.
type StatModifier = -2 | -1 | 0 | 1 | 2;

interface CharacterItem {
  name: string;
  concealed: boolean;
}
interface CharacterIdentity {
  name: string;
  pronouns?: string;
  concept?: string; // Who is this character? A brief description of their personality, background, or role in the story.
  weapon?: CharacterItem;
  instrument?: CharacterItem;
}

interface CharacterSkill {
  name: string;
  description: string;
  uses?: {
    usesLeft: number;
    maxUses: number;
  };
}
export interface CharacterSheet {
  archetype: CharacterArchetype;
  suit: CharacterSuit;
  damage: { [suit in CharacterSuit]: boolean };
  modifiers: { [stat in keyof CharacterSheet]: StatModifier };
  suitSkill: CharacterSkill; // TODO: create enum based on the suit-archetype combinations
  characterIdentity: CharacterIdentity;
  skills: CharacterSkill[]; // TODO: create enum based on the archetype skills
}
