import { describe, expect, it } from "vitest";
import type { CharacterSheet } from "~~/shared/types/character";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";
import { buildScriptPrompt } from "./script";

const makeCharacter = (
  overrides?: Partial<CharacterSheet>,
): CharacterSheet =>
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

const SETTING = "1920s Chicago speakeasy run by a supernatural crime boss";

describe("buildScriptPrompt", () => {
  describe("return shape", () => {
    it("returns an object with system and user string properties", () => {
      const result = buildScriptPrompt([makeCharacter()], SETTING);

      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("system prompt is non-empty", () => {
      const result = buildScriptPrompt([makeCharacter()], SETTING);
      expect(result.system.length).toBeGreaterThan(0);
    });

    it("user prompt is non-empty", () => {
      const result = buildScriptPrompt([makeCharacter()], SETTING);
      expect(result.user.length).toBeGreaterThan(0);
    });
  });

  describe("system prompt", () => {
    it("is the same regardless of input characters or setting", () => {
      const result1 = buildScriptPrompt([makeCharacter()], SETTING);
      const result2 = buildScriptPrompt(
        [
          makeCharacter({ archetype: "queen", suit: "hearts" }),
          makeCharacter({ archetype: "king", suit: "spades" }),
        ],
        "Fantasy medieval kingdom",
      );

      expect(result1.system).toBe(result2.system);
    });

    it("mentions the GameMasterScript schema", () => {
      const { system } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(system).toContain("GameMasterScript");
    });

    it("instructs the AI to respond with only JSON", () => {
      const { system } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(system).toContain("ONLY");
      expect(system).toContain("JSON");
    });

    it("mentions the game name", () => {
      const { system } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(system).toContain("The House Doesn't Always Win");
    });

    it("describes the three target archetypes", () => {
      const { system } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(system).toContain('"king"');
      expect(system).toContain('"queen"');
      expect(system).toContain('"jack"');
    });

    it("specifies exactly 10 weak points", () => {
      const { system } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(system).toContain("exactly 10");
    });
  });

  describe("user prompt", () => {
    it("includes the character name", () => {
      const { user } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(user).toContain("Vinnie 'Two-Fingers' Malone");
    });

    it("includes the character archetype", () => {
      const { user } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(user).toContain("jack");
    });

    it("includes the character suit", () => {
      const { user } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(user).toContain("clubs");
    });

    it("includes the character concept", () => {
      const { user } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(user).toContain("A streetwise enforcer with a heart of gold");
    });

    it("includes the campaign setting", () => {
      const { user } = buildScriptPrompt([makeCharacter()], SETTING);
      expect(user).toContain(SETTING);
    });

    it("includes all characters when multiple are provided", () => {
      const characters = [
        makeCharacter(),
        makeCharacter({
          archetype: "queen",
          suit: "hearts",
          characterIdentity: {
            name: "Lady Seraphina" as GeneratedText,
            concept:
              "A cunning diplomat hiding dark secrets" as GeneratedText,
          },
        }),
      ];
      const { user } = buildScriptPrompt(characters, SETTING);

      expect(user).toContain("Vinnie 'Two-Fingers' Malone");
      expect(user).toContain("Lady Seraphina");
      expect(user).toContain("queen");
      expect(user).toContain("hearts");
    });

    it("reflects different setting values", () => {
      const { user } = buildScriptPrompt(
        [makeCharacter()],
        "Cyberpunk dystopia",
      );
      expect(user).toContain("Cyberpunk dystopia");
    });

    it("handles a character with no concept gracefully", () => {
      const character = makeCharacter({
        characterIdentity: {
          name: "The Nameless" as GeneratedText,
        },
      });
      const { user } = buildScriptPrompt([character], SETTING);
      expect(user).toContain("The Nameless");
      expect(user).not.toContain("undefined");
    });
  });

  describe("edge cases", () => {
    it("handles an empty setting string without throwing", () => {
      expect(() => buildScriptPrompt([makeCharacter()], "")).not.toThrow();
    });

    it("handles a setting string with special characters", () => {
      const setting = 'A world of "fire & ice" <with> special chars';
      const { user } = buildScriptPrompt([makeCharacter()], setting);
      expect(user).toContain(setting);
    });

    it("handles a single character array", () => {
      expect(() =>
        buildScriptPrompt([makeCharacter()], SETTING),
      ).not.toThrow();
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
      const { user } = buildScriptPrompt(characters, SETTING);
      expect(user).toContain("Character 1");
      expect(user).toContain("Character 9");
    });
  });
});
