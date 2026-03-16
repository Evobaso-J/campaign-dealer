import { describe, it, expect } from "vitest";
import { buildCharacterPdf } from "./pdfCharacterSheet";
import type { CharacterSheet } from "~~/shared/types/character";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";

const mockCharacter: CharacterSheet = {
  archetype: "king",
  suit: "hearts",
  damage: { hearts: false, clubs: false, spades: false },
  modifiers: { hearts: 1, clubs: -1, spades: 0 },
  suitSkill: {
    name: "skills.king.suit.hearts.name" as I18nKey,
    description: "skills.king.suit.hearts.description" as I18nKey,
  },
  characterIdentity: {
    name: "Aldric Vane" as GeneratedText,
    pronouns: "he/him" as GeneratedText,
    concept:
      "A charming card shark with a hidden past and a knack for reading people." as GeneratedText,
    weapon: { name: "Silver Derringer" as GeneratedText, concealed: true },
    instrument: { name: "Violin" as GeneratedText, concealed: false },
  },
  archetypeSkills: [
    {
      name: "skills.king.archetype.skill1.name" as I18nKey,
      description: "skills.king.archetype.skill1.description" as I18nKey,
    },
    {
      name: "skills.king.archetype.skill3.name" as I18nKey,
      description: "skills.king.archetype.skill3.description" as I18nKey,
      uses: { usesLeft: 2, maxUses: 2 },
    },
  ],
};

const resolveI18n = (key: string) => key.split(".").pop() ?? key;

describe("buildCharacterPdf", () => {
  it("returns a non-empty Uint8Array", async () => {
    const result = await buildCharacterPdf(mockCharacter, resolveI18n);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it("produces a valid PDF (starts with %PDF header)", async () => {
    const result = await buildCharacterPdf(mockCharacter, resolveI18n);
    const header = new TextDecoder().decode(result.slice(0, 5));
    expect(header).toBe("%PDF-");
  });

  it("handles character without optional identity fields", async () => {
    const minimal: CharacterSheet = {
      ...mockCharacter,
      characterIdentity: {
        name: "Test" as GeneratedText,
      },
    };
    const result = await buildCharacterPdf(minimal, resolveI18n);
    expect(result.length).toBeGreaterThan(0);
  });
});
