import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateCharacter,
  generateRandomDistinctCharacters,
} from "~~/server/services/rpg/characterRandomizer";
import {
  archetypeCharacterizations,
  archetypeSkills,
  suitCharacterizations,
  suitSkills,
} from "~~/server/data/houseDoesntWin/characterTemplates";
import { CharacterArchetype, CharacterSuit } from "~~/shared/types/character";

const ALL_ARCHETYPES = Object.values(CharacterArchetype);

/**
 * Returns a Math.random mock value that maps to the given index in an array of `length`.
 * Uses the midpoint of the index's range to avoid floating-point edge cases.
 */
const randomFor = (index: number, length: number) => (index + 0.5) / length;

/**
 * We are testing random outputs with a statistical sample of 20 runs per test
 */
const RUNS = Array.from({ length: 20 }, (_, i) => i);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateCharacter", () => {
  describe("output shape", () => {
    it("returns all required fields", () => {
      const char = generateCharacter();
      expect(char).toHaveProperty("suit");
      expect(char).toHaveProperty("archetype");
      expect(char).toHaveProperty("damage");
      expect(char).toHaveProperty("modifiers");
      expect(char).toHaveProperty("suitSkill");
      expect(char).toHaveProperty("archetypeSkills");
      expect(char).toHaveProperty("suitCharacterization");
      expect(char).toHaveProperty("archetypeCharacterization");
    });

    it("does not include characterIdentity", () => {
      const char = generateCharacter();
      expect(char).not.toHaveProperty("characterIdentity");
    });
  });

  describe("damage", () => {
    it("initialises every suit to false", () => {
      const char = generateCharacter();
      expect(char.damage).toEqual({
        hearts: false,
        clubs: false,
        spades: false,
      });
    });
  });

  describe("suitSkill", () => {
    it.for(RUNS)(
      "matches the suitSkills[archetype][suit] lookup (run #%i)",
      (_) => {
        const char = generateCharacter();
        expect(char.suitSkill).toEqual(suitSkills[char.archetype][char.suit]);
      },
    );

    it("has string name and description", () => {
      const char = generateCharacter();
      expect(typeof char.suitSkill.name).toBe("string");
      expect(typeof char.suitSkill.description).toBe("string");
    });
  });

  describe("archetypeSkills", () => {
    it.for(RUNS)("contains exactly one skill (run #%i)", (_) => {
      expect(generateCharacter().archetypeSkills).toHaveLength(1);
    });

    it.for(RUNS)("the skill belongs to the archetype's pool (run #%i)", (_) => {
      const char = generateCharacter();
      const pool = archetypeSkills[char.archetype];
      expect(pool).toContainEqual(char.archetypeSkills[0]);
    });

    const archetypeSkillCases = ALL_ARCHETYPES.flatMap((archetype) => {
      const pool = archetypeSkills[archetype];
      return pool.map((_, skillIndex) => ({ archetype, skillIndex, pool }));
    });

    it.for(archetypeSkillCases)(
      "each skill in the pool can be selected when Math.random is controlled ($archetype, skill #$skillIndex)",
      ({ archetype, skillIndex, pool }) => {
        const archetypeIndex = ALL_ARCHETYPES.indexOf(archetype);
        vi.spyOn(Math, "random")
          .mockReturnValueOnce(0)
          .mockReturnValueOnce(randomFor(archetypeIndex, ALL_ARCHETYPES.length))
          .mockReturnValueOnce(randomFor(skillIndex, pool.length));

        const char = generateCharacter();
        expect(char.archetypeSkills[0]).toEqual(pool[skillIndex]);
      },
    );
  });

  describe("suitCharacterization", () => {
    it.for(RUNS)("matches suitCharacterizations[suit] (run #%i)", (_) => {
      const char = generateCharacter();
      expect(char.suitCharacterization).toBe(suitCharacterizations[char.suit]);
    });
  });

  describe("archetypeCharacterization", () => {
    it.for(RUNS)(
      "matches archetypeCharacterizations[archetype] (run #%i)",
      (_) => {
        const char = generateCharacter();
        expect(char.archetypeCharacterization).toBe(
          archetypeCharacterizations[char.archetype],
        );
      },
    );
  });
});

describe("generateRandomDistinctCharacters", () => {
  const ALL_SUITS = Object.values(CharacterSuit);
  const MAX_DISTINCT = ALL_ARCHETYPES.length * ALL_SUITS.length; // 3 × 3 = 9

  describe("count", () => {
    it.for([1, 3, 5, MAX_DISTINCT])(
      "returns exactly %i character(s)",
      (count) => {
        expect(generateRandomDistinctCharacters(count)).toHaveLength(count);
      },
    );
  });

  describe("validation", () => {
    it.for([MAX_DISTINCT + 1, MAX_DISTINCT + 10])(
      "throws when count (%i) exceeds the number of unique archetype-suit combinations",
      (count) => {
        expect(() => generateRandomDistinctCharacters(count)).toThrow(
          `Cannot generate ${count} distinct characters: only ${MAX_DISTINCT} unique archetype-suit combinations exist.`,
        );
      },
    );
  });

  describe("distinctness", () => {
    it.for([1, 3, MAX_DISTINCT])(
      "all archetype-suit combinations are unique (count=%i)",
      (count) => {
        const chars = generateRandomDistinctCharacters(count);
        const keys = chars.map((c) => `${c.archetype}-${c.suit}`);
        expect(new Set(keys).size).toBe(count);
      },
    );

    it("skips duplicate archetype-suit combinations and retries", () => {
      // Force the sequence: king-hearts, king-hearts (duplicate), king-clubs
      // generateCharacter call order per invocation: suit, archetype, skill
      vi.spyOn(Math, "random")
        // Call 1 → king-hearts
        .mockReturnValueOnce(randomFor(0, ALL_SUITS.length)) // hearts
        .mockReturnValueOnce(randomFor(0, ALL_ARCHETYPES.length)) // king
        .mockReturnValueOnce(0) // first archetype skill
        // Call 2 → king-hearts again (duplicate, must be skipped)
        .mockReturnValueOnce(randomFor(0, ALL_SUITS.length)) // hearts
        .mockReturnValueOnce(randomFor(0, ALL_ARCHETYPES.length)) // king
        .mockReturnValueOnce(0)
        // Call 3 → king-clubs (accepted as second distinct character)
        .mockReturnValueOnce(randomFor(1, ALL_SUITS.length)) // clubs
        .mockReturnValueOnce(randomFor(0, ALL_ARCHETYPES.length)) // king
        .mockReturnValueOnce(0);

      const chars = generateRandomDistinctCharacters(2);

      expect(chars).toHaveLength(2);
      expect(chars[0]).toMatchObject({ suit: "hearts", archetype: "king" });
      expect(chars[1]).toMatchObject({ suit: "clubs", archetype: "king" });
    });
  });
});
