import {
  archetypeCharacterizations,
  archetypeSkills,
  suitCharacterizations,
  suitSkills,
  type ArchetypeCharacterization,
  type SuitCharacterization,
} from "~~/server/data/houseDoesntWin/characterTemplates";
import {
  CharacterArchetype,
  type CharacterSheet,
  CharacterSuit,
} from "../types/character";

export type CharacterTemplate = Omit<CharacterSheet, "characterIdentity"> & {
  suitCharacterization: SuitCharacterization;
  archetypeCharacterization: ArchetypeCharacterization;
};

const getRandomElement = <T>(array: T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex]!;
};

/**
 * Returns the modifiers for a given suit, which consist of a -1 modifier for the given suit and a +1 modifier for another suit.
 * The remaining suit gets a 0 modifier.
 * @param suit
 * @returns
 */
const getSuitModifiers = (suit: CharacterSuit): CharacterSheet["modifiers"] => {
  const modifiers: CharacterSheet["modifiers"] = {
    hearts: 0,
    clubs: 0,
    spades: 0,
  };

  /**
   * Each suit gets a -1 modifier (which is positive, since lower is better) and another suit gets a +1 modifier.
   * This object maps each suit to the suit that gets the +1 modifier, so we can easily assign both modifiers in one step.
   */
  const malusSuitMap: Record<CharacterSuit, CharacterSuit> = {
    hearts: "clubs",
    clubs: "spades",
    spades: "hearts",
  };
  const malusSuit = malusSuitMap[suit];
  modifiers[suit] = -1;
  modifiers[malusSuit] = 1;
  return modifiers;
};

export const buildAllCharacterCombinations = (): {
  archetype: CharacterArchetype;
  suit: CharacterSuit;
}[] => {
  const suits = Object.values(CharacterSuit);
  const archetypes = Object.values(CharacterArchetype);
  return suits.flatMap((suit) =>
    archetypes.map((archetype) => ({ archetype, suit })),
  );
};

export const generateCharacterTemplate = (
  archetype: CharacterArchetype,
  suit: CharacterSuit,
): CharacterTemplate => {
  const suitSkill = suitSkills[archetype][suit];
  const suitCharacterization = suitCharacterizations[suit];
  const randomArchetypeSkill = getRandomElement(archetypeSkills[archetype]);
  const archetypeCharacterization = archetypeCharacterizations[archetype];

  return {
    suit,
    archetype,
    damage: { hearts: false, clubs: false, spades: false },
    modifiers: getSuitModifiers(suit),
    suitSkill,
    suitCharacterization,
    archetypeSkills: [randomArchetypeSkill],
    archetypeCharacterization,
  };
};
