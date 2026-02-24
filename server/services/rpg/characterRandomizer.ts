import {
  archetypeCharacterizations,
  archetypeSkills,
  suitCharacterizations,
  suitSkills,
  type ArchetypeCharacterization,
  type SuitCharacterization,
} from "~~/server/data/houseDoesntWin/characterTemplates";
import {
  ValidationError,
  ok,
  err,
  type Result,
} from "~~/server/utils/errors";
import {
  CharacterArchetype,
  type CharacterSheet,
  CharacterSuit,
} from "~~/shared/types/character";

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

export const generateCharacter = (): CharacterTemplate => {
  const suits = Object.values(CharacterSuit);
  const archetypes = Object.values(CharacterArchetype);

  const randomSuit = getRandomElement(suits);
  const randomArchetype = getRandomElement(archetypes);

  const suitSkill = suitSkills[randomArchetype][randomSuit];
  const suitCharacterization = suitCharacterizations[randomSuit];

  const randomArchetypeSkill = getRandomElement(
    archetypeSkills[randomArchetype],
  );
  const archetypeCharacterization = archetypeCharacterizations[randomArchetype];

  return {
    suit: randomSuit,
    archetype: randomArchetype,
    damage: {
      hearts: false,
      clubs: false,
      spades: false,
    },
    modifiers: getSuitModifiers(randomSuit),
    suitSkill,
    suitCharacterization,
    archetypeSkills: [randomArchetypeSkill],
    archetypeCharacterization,
  };
};

export const generateRandomDistinctCharacters = (
  count: number,
): Result<CharacterTemplate[], ValidationError> => {
  const suits = Object.values(CharacterSuit);
  const archetypes = Object.values(CharacterArchetype);
  const maxDistinct = suits.length * archetypes.length;
  if (count > maxDistinct) {
    return err(
      new ValidationError(
        `Cannot generate ${count} distinct characters: only ${maxDistinct} unique archetype-suit combinations exist.`,
      ),
    );
  }

  const generatedCharacters = new Map<
    `${CharacterArchetype}-${CharacterSuit}`,
    CharacterTemplate
  >();
  while (generatedCharacters.size < count) {
    const newCharacter = generateCharacter();
    const key = `${newCharacter.archetype}-${newCharacter.suit}` as const;
    if (!generatedCharacters.has(key)) {
      generatedCharacters.set(key, newCharacter);
    }
  }
  return ok(Array.from(generatedCharacters.values()));
};
