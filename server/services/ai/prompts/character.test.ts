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

const defaults = () =>
  ({ template: makeTemplate(), setting: SETTING, language: "en" as const });

describe("buildCharacterPrompt", () => {
  describe("return shape", () => {
    it("returns an object with system and user string properties", () => {
      const result = buildCharacterPrompt(defaults());

      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("system prompt is non-empty", () => {
      const result = buildCharacterPrompt(defaults());
      expect(result.system.length).toBeGreaterThan(0);
    });

    it("user prompt is non-empty", () => {
      const result = buildCharacterPrompt(defaults());
      expect(result.user.length).toBeGreaterThan(0);
    });

    it("includes a jsonSchema for structured output", () => {
      const result = buildCharacterPrompt(defaults());
      expect(result.jsonSchema).toBeDefined();
      expect(result.jsonSchema).toHaveProperty("type", "object");
      expect(result.jsonSchema).toHaveProperty("properties");
    });

    it("jsonSchema includes the expected CharacterIdentity fields", () => {
      const result = buildCharacterPrompt(defaults());
      const props = result.jsonSchema!.properties as Record<string, unknown>;
      expect(props).toHaveProperty("name");
      expect(props).toHaveProperty("concept");
      expect(props).toHaveProperty("weapon");
      expect(props).toHaveProperty("instrument");
    });
  });

  describe("system prompt", () => {
    it("is the same regardless of input template or setting", () => {
      const result1 = buildCharacterPrompt(defaults());
      const result2 = buildCharacterPrompt({
        template: makeTemplate({ archetype: "queen", suit: "hearts" }),
        setting: ["highFantasy"],
        language: "en",
      });

      expect(result1.system).toBe(result2.system);
    });

    it("mentions the CharacterIdentity schema", () => {
      const { system } = buildCharacterPrompt(defaults());
      expect(system).toContain("CharacterIdentity");
    });

    it("instructs the AI to respond with only JSON", () => {
      const { system } = buildCharacterPrompt(defaults());
      expect(system).toContain("ONLY");
      expect(system).toContain("JSON");
    });

    it("mentions the game name", () => {
      const { system } = buildCharacterPrompt(defaults());
      expect(system).toContain("The House Doesn't Always Win");
    });

    it("mentions the Diamonds faction and revolutionary context", () => {
      const { system } = buildCharacterPrompt(defaults());
      expect(system).toContain("Diamonds");
      expect(system).toContain("revolutionaries");
    });

    it("guides equipment to be realistic for underdogs", () => {
      const { system } = buildCharacterPrompt(defaults());
      expect(system).toContain("realistically available");
    });
  });

  describe("user prompt", () => {
    it("includes the archetype name", () => {
      const { user } = buildCharacterPrompt(defaults());
      expect(user).toContain("jack");
    });

    it("includes the archetype characterization text", () => {
      const { user } = buildCharacterPrompt(defaults());
      expect(user).toContain(
        "The Jack is more at ease on the front line than behind a desk.",
      );
    });

    it("includes the suit name", () => {
      const { user } = buildCharacterPrompt(defaults());
      expect(user).toContain("clubs");
    });

    it("includes the suit characterization text", () => {
      const { user } = buildCharacterPrompt(defaults());
      expect(user).toContain(
        "Clubs characters lead with their body and their will.",
      );
    });

    it("includes all genre names from the setting", () => {
      const { user } = buildCharacterPrompt(defaults());
      expect(user).toContain("cyberpunk");
      expect(user).toContain("conspiracyThriller");
    });

    it("reflects different template values", () => {
      const { user } = buildCharacterPrompt({
        template: makeTemplate({ archetype: "queen", suit: "spades" }),
        setting: ["highFantasy", "gothicHorror"],
        language: "en",
      });

      expect(user).toContain("queen");
      expect(user).toContain("spades");
      expect(user).toContain("highFantasy");
      expect(user).toContain("gothicHorror");
    });
  });

  describe("language instruction", () => {
    it("includes English language instruction when language is 'en'", () => {
      const { user } = buildCharacterPrompt(defaults());
      expect(user).toContain("Language: English");
      expect(user).toContain("All generated text must be written in English,");
    });

    it("includes Italian language instruction when language is 'it'", () => {
      const { user } = buildCharacterPrompt({ ...defaults(), language: "it" });
      expect(user).toContain("Language: Italian");
      expect(user).toContain("All generated text must be written in Italian,");
    });
  });

  describe("edge cases", () => {
    it("handles an empty setting array without throwing", () => {
      expect(() => buildCharacterPrompt({ ...defaults(), setting: [] })).not.toThrow();
    });

    it("handles a single genre setting", () => {
      const { user } = buildCharacterPrompt({ ...defaults(), setting: ["steampunk"] });
      expect(user).toContain("steampunk");
    });
  });
});
