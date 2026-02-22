import { describe, expect, it } from "vitest";
import {
  i18nSkill,
  jackSuitSkills,
  jackArchetypeSkills,
  queenSuitSkills,
  queenArchetypeSkills,
  kingSuitSkills,
  kingArchetypeSkills,
  modifiersSkills,
} from "~~/server/data/house-doesnt-win/character-templates";
import type { CharacterSuit } from "~~/shared/types/character";

const ALL_SUITS: CharacterSuit[] = ["hearts", "clubs", "spades"];

describe("i18nSkill", () => {
  it("appends .name and .description to the given prefix", () => {
    const result = i18nSkill("skills.jack.suit.hearts");
    expect(result.name).toBe("skills.jack.suit.hearts.name");
    expect(result.description).toBe("skills.jack.suit.hearts.description");
  });

  it("returns an object with exactly two keys", () => {
    const result = i18nSkill("any.prefix");
    expect(Object.keys(result)).toHaveLength(2);
    expect(Object.keys(result).sort()).toEqual(["description", "name"]);
  });
});

// ---------- Suit skills ----------

describe("suit skills", () => {
  const suitSkillSets = {
    jack: jackSuitSkills,
    queen: queenSuitSkills,
    king: kingSuitSkills,
    modifiers: modifiersSkills,
  };

  for (const [label, suitSkills] of Object.entries(suitSkillSets)) {
    describe(label, () => {
      it("has exactly all three suits as keys", () => {
        expect(Object.keys(suitSkills).sort()).toEqual([...ALL_SUITS].sort());
      });

      for (const suit of ALL_SUITS) {
        it(`${suit} has name and description`, () => {
          const skill = suitSkills[suit];
          expect(skill.name).toBeDefined();
          expect(skill.description).toBeDefined();
          expect(typeof skill.name).toBe("string");
          expect(typeof skill.description).toBe("string");
        });
      }
    });
  }
});

// ---------- Archetype skills ----------

describe("archetype skills", () => {
  const archetypeSkillSets = {
    jack: jackArchetypeSkills,
    queen: queenArchetypeSkills,
    king: kingArchetypeSkills,
  };

  const expectedCount = jackArchetypeSkills.length;

  it("all archetypes have the same number of skills", () => {
    for (const [label, skills] of Object.entries(archetypeSkillSets)) {
      expect(
        skills.length,
        `${label} should have ${expectedCount} skills`,
      ).toBe(expectedCount);
    }
  });

  for (const [label, skills] of Object.entries(archetypeSkillSets)) {
    describe(label, () => {
      it.each(skills.map((s, i) => [i + 1, s]))(
        "skill %i has name and description",
        (_index, skill) => {
          expect(skill.name).toBeDefined();
          expect(skill.description).toBeDefined();
          expect(typeof skill.name).toBe("string");
          expect(typeof skill.description).toBe("string");
        },
      );

      it("every skill with uses has usesLeft = maxUses", () => {
        for (const skill of skills) {
          if (skill.uses) {
            expect(skill.uses.usesLeft).toBe(skill.uses.maxUses);
            expect(skill.uses.maxUses).toBeGreaterThan(0);
          }
        }
      });
    });
  }
});
