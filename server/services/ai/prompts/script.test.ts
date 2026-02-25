import { describe, expect, it } from "vitest";
import type { CharacterSheet } from "~~/shared/types/character";
import type { Genre } from "~~/shared/types/campaign";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";
import { buildScriptPrompt } from "./script";

const makeCharacter = (overrides?: Partial<CharacterSheet>): CharacterSheet =>
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
    characterIdentity: {
      name: "Vinnie 'Two-Fingers' Malone" as GeneratedText,
      pronouns: "he/him" as GeneratedText,
      concept: "A streetwise enforcer with a heart of gold" as GeneratedText,
      weapon: { name: "Brass knuckles" as GeneratedText, concealed: true },
      instrument: { name: "Harmonica" as GeneratedText, concealed: false },
    },
    ...overrides,
  }) as CharacterSheet;

const SETTING: Genre[] = ["cyberpunk", "conspiracyThriller"];

const defaults = () =>
  ({ characters: [makeCharacter()], setting: SETTING, language: "en" as const });

describe("buildScriptPrompt", () => {
  describe("return shape", () => {
    it("returns an object with system and user string properties", () => {
      const result = buildScriptPrompt(defaults());

      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("system prompt is non-empty", () => {
      const result = buildScriptPrompt(defaults());
      expect(result.system.length).toBeGreaterThan(0);
    });

    it("user prompt is non-empty", () => {
      const result = buildScriptPrompt(defaults());
      expect(result.user.length).toBeGreaterThan(0);
    });

    it("includes a jsonSchema for structured output", () => {
      const result = buildScriptPrompt(defaults());
      expect(result.jsonSchema).toBeDefined();
      expect(result.jsonSchema).toHaveProperty("type", "object");
      expect(result.jsonSchema).toHaveProperty("properties");
    });

    it("jsonSchema includes the expected GameMasterScript fields", () => {
      const result = buildScriptPrompt(defaults());
      const props = result.jsonSchema!.properties as Record<string, unknown>;
      expect(props).toHaveProperty("hook");
      expect(props).toHaveProperty("targets");
      expect(props).toHaveProperty("weakPoints");
      expect(props).toHaveProperty("scenes");
      expect(props).toHaveProperty("centralTension");
      expect(props).toHaveProperty("plot");
    });
  });

  describe("system prompt", () => {
    it("is the same regardless of input characters or setting", () => {
      const result1 = buildScriptPrompt(defaults());
      const result2 = buildScriptPrompt({
        characters: [
          makeCharacter({ archetype: "queen", suit: "hearts" }),
          makeCharacter({ archetype: "king", suit: "spades" }),
        ],
        setting: ["highFantasy"],
        language: "en",
      });

      expect(result1.system).toBe(result2.system);
    });

    it("mentions the GameMasterScript schema", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("GameMasterScript");
    });

    it("instructs the AI to respond with only JSON", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("ONLY");
      expect(system).toContain("JSON");
    });

    it("mentions the game name", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("The House Doesn't Always Win");
    });

    it("describes the three target archetypes", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain('"king"');
      expect(system).toContain('"queen"');
      expect(system).toContain('"jack"');
    });

    it("requires a description for each target", () => {
      const { system } = buildScriptPrompt(defaults());
      // Each target object in the schema must include a "description" field
      const descriptionMatches = system.match(
        /"description": string \(required\)/g,
      );
      expect(descriptionMatches).not.toBeNull();
      expect(descriptionMatches!.length).toBe(3);
    });

    it("specifies exactly 10 weak points", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("exactly 10");
    });

    it("structures the campaign as three sessions", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("three sessions");
    });

    it("includes the plot field in the schema", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain('"plot"');
    });

    it("does not hardcode a fixed archetype order for sessions", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("narrative escalation");
      expect(system).toContain("need not follow Jack, Queen, King");
    });

    it("mentions the Diamonds faction", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system).toContain("Diamonds");
    });

    it("mentions the three approaches to defeating targets", () => {
      const { system } = buildScriptPrompt(defaults());
      expect(system.toLowerCase()).toContain("captured");
      expect(system.toLowerCase()).toContain("converted");
      expect(system.toLowerCase()).toContain("eliminated");
    });
  });

  describe("user prompt", () => {
    it("includes the character name", () => {
      const { user } = buildScriptPrompt(defaults());
      expect(user).toContain("Vinnie 'Two-Fingers' Malone");
    });

    it("includes the character archetype", () => {
      const { user } = buildScriptPrompt(defaults());
      expect(user).toContain("jack");
    });

    it("includes the character suit", () => {
      const { user } = buildScriptPrompt(defaults());
      expect(user).toContain("clubs");
    });

    it("includes the character concept", () => {
      const { user } = buildScriptPrompt(defaults());
      expect(user).toContain("A streetwise enforcer with a heart of gold");
    });

    it("includes all genre names from the setting", () => {
      const { user } = buildScriptPrompt(defaults());
      expect(user).toContain("cyberpunk");
      expect(user).toContain("conspiracyThriller");
    });

    it("includes all characters when multiple are provided", () => {
      const { user } = buildScriptPrompt({
        characters: [
          makeCharacter(),
          makeCharacter({
            archetype: "queen",
            suit: "hearts",
            characterIdentity: {
              name: "Lady Seraphina" as GeneratedText,
              concept: "A cunning diplomat hiding dark secrets" as GeneratedText,
            },
          }),
        ],
        setting: SETTING,
        language: "en",
      });

      expect(user).toContain("Vinnie 'Two-Fingers' Malone");
      expect(user).toContain("Lady Seraphina");
      expect(user).toContain("queen");
      expect(user).toContain("hearts");
    });

    it("reflects different setting values", () => {
      const { user } = buildScriptPrompt({
        ...defaults(),
        setting: ["highFantasy", "gothicHorror"],
      });
      expect(user).toContain("highFantasy");
      expect(user).toContain("gothicHorror");
    });

    it("handles a character with no concept gracefully", () => {
      const { user } = buildScriptPrompt({
        ...defaults(),
        characters: [
          makeCharacter({
            characterIdentity: {
              name: "The Nameless" as GeneratedText,
            },
          }),
        ],
      });
      expect(user).toContain("The Nameless");
      expect(user).not.toContain("undefined");
    });
  });

  describe("language instruction", () => {
    it("includes English language instruction when language is 'en'", () => {
      const { user } = buildScriptPrompt(defaults());
      expect(user).toContain("Language: English");
      expect(user).toContain("All generated text must be written in English.");
    });

    it("includes Italian language instruction when language is 'it'", () => {
      const { user } = buildScriptPrompt({ ...defaults(), language: "it" });
      expect(user).toContain("Language: Italian");
      expect(user).toContain("All generated text must be written in Italian.");
    });
  });

  describe("edge cases", () => {
    it("handles an empty setting array without throwing", () => {
      expect(() => buildScriptPrompt({ ...defaults(), setting: [] })).not.toThrow();
    });

    it("handles a single genre setting", () => {
      const { user } = buildScriptPrompt({ ...defaults(), setting: ["steampunk"] });
      expect(user).toContain("steampunk");
    });

    it("handles a single character array", () => {
      expect(() => buildScriptPrompt(defaults())).not.toThrow();
    });

    it("handles a large party of characters", () => {
      const characters = Array.from({ length: 9 }, (_, i) =>
        makeCharacter({
          characterIdentity: {
            name: `Character ${i + 1}` as GeneratedText,
            concept: `Concept ${i + 1}` as GeneratedText,
          },
        }),
      );
      const { user } = buildScriptPrompt({ characters, setting: SETTING, language: "en" });
      expect(user).toContain("Character 1");
      expect(user).toContain("Character 9");
    });
  });
});
