import type { CharacterSkill, CharacterSuit } from "~~/shared/types/character";
import type { I18nKey } from "~~/shared/types/utils";

/**
 * Generates i18n key pairs for a skill from a dot-separated key prefix.
 * The branded `I18nKey` cast lives here — the only place it's needed.
 *
 * @example
 * i18nSkill("skills.jack.suit.hearts")
 * // → { name: "skills.jack.suit.hearts.name", description: "skills.jack.suit.hearts.description" }
 */
export function i18nSkill(
  keyPrefix: string,
): Pick<CharacterSkill, "name" | "description"> {
  return {
    name: `${keyPrefix}.name` as I18nKey,
    description: `${keyPrefix}.description` as I18nKey,
  };
}

// === JACK ===
type SuitSkills = { [suit in CharacterSuit]: CharacterSkill };

export const jackSuitSkills: SuitSkills = {
  hearts: i18nSkill("skills.jack.suit.hearts"),
  clubs: {
    ...i18nSkill("skills.jack.suit.clubs"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  spades: i18nSkill("skills.jack.suit.spades"),
};

export const jackArchetypeSkills: CharacterSkill[] = [
  i18nSkill("skills.jack.archetype.skill1"),
  {
    ...i18nSkill("skills.jack.archetype.skill2"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    ...i18nSkill("skills.jack.archetype.skill3"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    ...i18nSkill("skills.jack.archetype.skill4"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  i18nSkill("skills.jack.archetype.skill5"),
  {
    ...i18nSkill("skills.jack.archetype.skill6"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  i18nSkill("skills.jack.archetype.skill7"),
];

// === QUEEN ===

export const queenSuitSkills: SuitSkills = {
  hearts: {
    ...i18nSkill("skills.queen.suit.hearts"),
    uses: { usesLeft: 2, maxUses: 2 },
  },
  clubs: i18nSkill("skills.queen.suit.clubs"),
  spades: i18nSkill("skills.queen.suit.spades"),
};

export const queenArchetypeSkills: CharacterSkill[] = [
  i18nSkill("skills.queen.archetype.skill1"),
  i18nSkill("skills.queen.archetype.skill2"),
  {
    ...i18nSkill("skills.queen.archetype.skill3"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    ...i18nSkill("skills.queen.archetype.skill4"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    ...i18nSkill("skills.queen.archetype.skill5"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    ...i18nSkill("skills.queen.archetype.skill6"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    ...i18nSkill("skills.queen.archetype.skill7"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
];

// === KING ===

export const kingSuitSkills: SuitSkills = {
  hearts: i18nSkill("skills.king.suit.hearts"),
  clubs: i18nSkill("skills.king.suit.clubs"),
  spades: i18nSkill("skills.king.suit.spades"),
};

export const kingArchetypeSkills: CharacterSkill[] = [
  i18nSkill("skills.king.archetype.skill1"),
  i18nSkill("skills.king.archetype.skill2"),
  i18nSkill("skills.king.archetype.skill3"),
  i18nSkill("skills.king.archetype.skill4"),
  i18nSkill("skills.king.archetype.skill5"),
  i18nSkill("skills.king.archetype.skill6"),
  i18nSkill("skills.king.archetype.skill7"),
];

// === MODIFIERS ===

export const modifiersSkills: SuitSkills = {
  clubs: i18nSkill("skills.modifiers.clubs"),
  hearts: i18nSkill("skills.modifiers.hearts"),
  spades: i18nSkill("skills.modifiers.spades"),
};
