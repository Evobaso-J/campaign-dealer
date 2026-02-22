import type {
  CharacterArchetype,
  CharacterSkill,
  CharacterSuit,
} from "~~/shared/types/character";
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

export const jackCharacterization: string =
  `The Jack is more at ease on the front line than in the rear guard. He excels
when he throws himself headlong into situations and is skilled at improvising.
If you like a Character who always gets a second chance and has a special
talent for getting out of tight spots, then the Jack is the Archetype for you.` as const;

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

export const queenCharacterization: string =
  `The Queen knows that every move toward success must be fueled not only by
ideas, but also by flesh and blood. She manages people the way a soldier
manages ammunition: never wasting them, but willing to sacrifice them.
If you like a Character who leads from the rear and juggles the lives of
others, then the Queen is the Archetype for you.` as const;

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

export const kingCharacterization: string =
  `The King has a plan for every contingency, an escape route for every
unexpected turn, and the ability to bend the rules to his advantage. He knows
that timing is everything. If you like a Character who always has an ace up
his sleeve and as many allies as enemies, then the King is the Archetype for you.` as const;

// === MODIFIERS ===

export const modifiersSkills: SuitSkills = {
  clubs: i18nSkill("skills.modifiers.clubs"),
  hearts: i18nSkill("skills.modifiers.hearts"),
  spades: i18nSkill("skills.modifiers.spades"),
};

export const clubsCharacterization: string =
  `Clubs characters lead with their body and their will. They break down
doors rather than pick locks, endure punishment rather than avoid it, and
command rooms with their sheer, unshakeable presence. If you like a Character
who charges headlong into the thick of it and never stops pushing forward,
then Clubs is your suit.` as const;

export const heartsCharacterization: string =
  `Hearts characters know that the right word, spoken at the right moment,
is worth more than any weapon. They read people like cards, weave charm and
cunning into something sharper than steel, and always seem to know exactly
what someone needs to hear. If you like a Character who wins before the fight
even starts — through persuasion, wit, and an eye for what others miss —
then Hearts is your suit.` as const;

export const spadesCharacterization: string =
  `Spades characters move through the world like smoke — precise, silent,
and gone before anyone realizes they were there. They prefer a steady hand
over a heavy fist, finesse over force, and always know three ways out of any
room. If you like a Character who slips through the cracks and pulls off the
impossible with a light touch and a quiet step, then Spades is your suit.` as const;

// === CONFIGURATION MAPS ===

export const suitCharacterizations: Record<
  CharacterSuit,
  SuitCharacterization
> = {
  clubs: clubsCharacterization,
  hearts: heartsCharacterization,
  spades: spadesCharacterization,
} as const;

export type SuitCharacterization =
  | typeof clubsCharacterization
  | typeof heartsCharacterization
  | typeof spadesCharacterization;

export const archetypeCharacterizations: Record<
  CharacterArchetype,
  ArchetypeCharacterization
> = {
  jack: jackCharacterization,
  queen: queenCharacterization,
  king: kingCharacterization,
} as const;

export type ArchetypeCharacterization =
  | typeof jackCharacterization
  | typeof queenCharacterization
  | typeof kingCharacterization;

export const suitSkills: Record<CharacterArchetype, SuitSkills> = {
  jack: jackSuitSkills,
  queen: queenSuitSkills,
  king: kingSuitSkills,
} as const;

export const archetypeSkills: Record<CharacterArchetype, CharacterSkill[]> = {
  jack: jackArchetypeSkills,
  queen: queenArchetypeSkills,
  king: kingArchetypeSkills,
} as const;
