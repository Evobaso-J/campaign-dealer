import type { CharacterSkill } from "~~/shared/types/character";
import type { I18nKey } from "~~/shared/types/utils";

type SuitSkills = { [suit in CharacterSuit]: CharacterSkill };

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

export const jackSuitSkills: SuitSkills = {
  hearts: i18nSkill("skills.jack.suit.hearts"),
  clubs: {
    ...i18nSkill("skills.jack.suit.clubs"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  spades: i18nSkill("skills.jack.suit.spades"),
};

export const jackArchetypeSkills: CharacterSkill[] = [
  i18nSkill("skills.jack.archetype.daiMoltiTalenti"),
  {
    ...i18nSkill("skills.jack.archetype.riscuotereUnDebito"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    ...i18nSkill("skills.jack.archetype.perUnPelo"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    ...i18nSkill("skills.jack.archetype.giocoDiSquadra"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  i18nSkill("skills.jack.archetype.pagareIlPrezzo"),
  {
    ...i18nSkill("skills.jack.archetype.abbastanzaStupidoDaFunzionare"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  i18nSkill("skills.jack.archetype.perPrecauzione"),
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
  i18nSkill("skills.queen.archetype.sacrificio"),
  i18nSkill("skills.queen.archetype.nonOggi"),
  {
    ...i18nSkill("skills.queen.archetype.affidabile"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    ...i18nSkill("skills.queen.archetype.scudo"),
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    ...i18nSkill("skills.queen.archetype.soBadareAMe"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    ...i18nSkill("skills.queen.archetype.inSerbo"),
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    ...i18nSkill("skills.queen.archetype.preveggente"),
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
  i18nSkill("skills.king.archetype.qualcosaInPiu"),
  i18nSkill("skills.king.archetype.premioDiConsolazione"),
  i18nSkill("skills.king.archetype.pianiBenRiusciti"),
  i18nSkill("skills.king.archetype.ilToccoGiusto"),
  i18nSkill("skills.king.archetype.doppioFondo"),
  i18nSkill("skills.king.archetype.sempreSulPezzo"),
  i18nSkill("skills.king.archetype.miSeiDIntralcio"),
];

export const modifiersSkills: CharacterSkill[] = [
  i18nSkill("skills.modifiers.aBitMoreMuscle"),
  i18nSkill("skills.modifiers.aBitMoreBrain"),
  i18nSkill("skills.modifiers.aBitMoreBalance"),
];
