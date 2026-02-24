import { describe, expect, it } from "vitest";
import type { CharacterTemplate } from "~~/server/services/rpg/characterRandomizer";
import type { Genre } from "~~/shared/types/campaign";
import type { I18nKey } from "~~/shared/types/utils";
import { buildCharacterPrompt } from "./character";

const makeTemplate = (overrides?: Partial<CharacterTemplate>): CharacterTemplate =>
  ({
    archetype: "jack",
    suit: "clubs",
    damage: { hearts: false, clubs: false, spades: false },
    modifiers: { hearts: 0, clubs: -1, spades: 1 },
    suitSkill: {
      name: "skills.jack.suit.clubs.name" as I18nKey,
      description: "skills.jack.suit.clubs.description" as I18nKey,
    },
    archetypeSkills: [
      {
        name: "skills.jack.archetype.skill1.name" as I18nKey,
        description: "skills.jack.archetype.skill1.description" as I18nKey,
      },
    ],
    suitCharacterization: "Clubs characters lead with their body and their will.",
    archetypeCharacterization:
      "The Jack is more at ease on the front line than behind a desk.",
    ...overrides,
  }) as CharacterTemplate;

const SETTING: Genre[] = ["cyberpunk", "conspiracyThriller"];

describe("buildCharacterPrompt", () => {
  describe("return shape", () => {
    it("returns an object with system and user string properties", () => {
      const result = buildCharacterPrompt(makeTemplate(), SETTING, "en");

      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("system prompt is non-empty", () => {
      const result = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(result.system.length).toBeGreaterThan(0);
    });

    it("user prompt is non-empty", () => {
      const result = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(result.user.length).toBeGreaterThan(0);
    });
  });

  describe("system prompt", () => {
    it("is the same regardless of input template or setting", () => {
      const result1 = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      const result2 = buildCharacterPrompt(
        makeTemplate({ archetype: "queen", suit: "hearts" }),
        ["highFantasy"],
        "en",
      );

      expect(result1.system).toBe(result2.system);
    });

    it("mentions the CharacterIdentity schema", () => {
      const { system } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(system).toContain("CharacterIdentity");
    });

    it("instructs the AI to respond with only JSON", () => {
      const { system } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(system).toContain("ONLY");
      expect(system).toContain("JSON");
    });

    it("mentions the game name", () => {
      const { system } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(system).toContain("The House Doesn't Always Win");
    });

    it("mentions the Diamonds faction and revolutionary context", () => {
      const { system } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(system).toContain("Diamonds");
      expect(system).toContain("revolutionaries");
    });

    it("guides equipment to be realistic for underdogs", () => {
      const { system } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(system).toContain("realistically available");
    });
  });

  describe("user prompt", () => {
    it("includes the archetype name", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(user).toContain("jack");
    });

    it("includes the archetype characterization text", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(user).toContain(
        "The Jack is more at ease on the front line than behind a desk.",
      );
    });

    it("includes the suit name", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(user).toContain("clubs");
    });

    it("includes the suit characterization text", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(user).toContain(
        "Clubs characters lead with their body and their will.",
      );
    });

    it("includes all genre names from the setting", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(user).toContain("cyberpunk");
      expect(user).toContain("conspiracyThriller");
    });

    it("reflects different template values", () => {
      const template = makeTemplate({
        archetype: "queen",
        suit: "spades",
      });
      const { user } = buildCharacterPrompt(template, ["highFantasy", "gothicHorror"], "en");

      expect(user).toContain("queen");
      expect(user).toContain("spades");
      expect(user).toContain("highFantasy");
      expect(user).toContain("gothicHorror");
    });
  });

  describe("language instruction", () => {
    it("includes English language instruction when language is 'en'", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "en");
      expect(user).toContain("Language: English");
      expect(user).toContain("All generated text must be written in English.");
    });

    it("includes Italian language instruction when language is 'it'", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), SETTING, "it");
      expect(user).toContain("Language: Italian");
      expect(user).toContain("All generated text must be written in Italian.");
    });
  });

  describe("edge cases", () => {
    it("handles an empty setting array without throwing", () => {
      expect(() => buildCharacterPrompt(makeTemplate(), [], "en")).not.toThrow();
    });

    it("handles a single genre setting", () => {
      const { user } = buildCharacterPrompt(makeTemplate(), ["steampunk"], "en");
      expect(user).toContain("steampunk");
    });
  });
});
