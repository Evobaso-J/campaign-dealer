import { describe, expect, it } from "vitest";
import {
  characterIdentitySchema,
  charactersRequestSchema,
  scriptRequestSchema,
} from "./validate";

const validTemplate = {
  archetype: "king",
  suit: "hearts",
  damage: { hearts: false, clubs: false, spades: false },
  modifiers: { hearts: -1, clubs: 1, spades: 0 },
  suitSkill: {
    name: "skill.king.hearts",
    description: "skill.king.hearts.desc",
  },
  archetypeSkills: [{ name: "skill.king.1", description: "skill.king.1.desc" }],
  suitCharacterization: "Hearts description",
  archetypeCharacterization: "King description",
};

describe("charactersRequestSchema", () => {
  it("accepts valid input", () => {
    const result = charactersRequestSchema.parse({
      templates: [validTemplate],
      setting: ["cyberpunk"],
      language: "en",
    });
    expect(result.templates).toHaveLength(1);
    expect(result.setting).toEqual(["cyberpunk"]);
    expect(result.language).toBe("en");
  });

  it("accepts max 4 templates", () => {
    const result = charactersRequestSchema.parse({
      templates: [
        validTemplate,
        { ...validTemplate, archetype: "queen" },
        { ...validTemplate, archetype: "jack" },
        { ...validTemplate, suit: "clubs" },
      ],
      setting: ["highFantasy", "darkFantasy"],
      language: "it",
    });
    expect(result.templates).toHaveLength(4);
  });

  it("rejects empty templates array", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [],
        setting: ["cyberpunk"],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects more than 4 templates", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [
          validTemplate,
          { ...validTemplate, archetype: "queen" },
          { ...validTemplate, archetype: "jack" },
          { ...validTemplate, suit: "clubs" },
          { ...validTemplate, suit: "clubs", archetype: "queen" },
        ],
        setting: ["cyberpunk"],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects duplicate archetype-suit pairs", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [validTemplate, validTemplate],
        setting: ["cyberpunk"],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects empty setting array", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [validTemplate],
        setting: [],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects invalid genre", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [validTemplate],
        setting: ["notAGenre"],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects missing language", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [validTemplate],
        setting: ["cyberpunk"],
      }),
    ).toThrow();
  });

  it("rejects invalid language", () => {
    expect(() =>
      charactersRequestSchema.parse({
        templates: [validTemplate],
        setting: ["cyberpunk"],
        language: "fr",
      }),
    ).toThrow();
  });
});

describe("scriptRequestSchema", () => {
  const validCharacter = {
    archetype: "king",
    suit: "hearts",
    damage: { hearts: false, clubs: false, spades: false },
    modifiers: { hearts: 1, clubs: 0, spades: -1 },
    suitSkill: {
      name: "skill.hearts.king",
      description: "skill.hearts.king.desc",
    },
    characterIdentity: { name: "Test Character" },
    archetypeSkills: [
      { name: "skill.king.1", description: "skill.king.1.desc" },
    ],
  };

  it("accepts valid input", () => {
    const result = scriptRequestSchema.parse({
      characters: [validCharacter],
      setting: ["cyberpunk"],
      language: "en",
    });
    expect(result.characters).toHaveLength(1);
  });

  it("rejects empty characters array", () => {
    expect(() =>
      scriptRequestSchema.parse({
        characters: [],
        setting: ["cyberpunk"],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects missing characterIdentity", () => {
    const { characterIdentity: _, ...noIdentity } = validCharacter;
    expect(() =>
      scriptRequestSchema.parse({
        characters: [noIdentity],
        setting: ["cyberpunk"],
        language: "en",
      }),
    ).toThrow();
  });

  it("rejects invalid archetype", () => {
    expect(() =>
      scriptRequestSchema.parse({
        characters: [{ ...validCharacter, archetype: "wizard" }],
        setting: ["cyberpunk"],
        language: "en",
      }),
    ).toThrow();
  });

  it("accepts character with optional identity fields", () => {
    const char = {
      ...validCharacter,
      characterIdentity: {
        name: "Hero",
        pronouns: "they/them",
        concept: "A wandering knight",
        weapon: { name: "Sword", concealed: false },
        instrument: { name: "Lute", concealed: true },
      },
    };
    const result = scriptRequestSchema.parse({
      characters: [char],
      setting: ["spaceOpera"],
      language: "en",
    });
    expect(result.characters[0]!.characterIdentity.weapon?.name).toBe("Sword");
  });

  it("rejects missing language", () => {
    expect(() =>
      scriptRequestSchema.parse({
        characters: [validCharacter],
        setting: ["cyberpunk"],
      }),
    ).toThrow();
  });
});

describe("characterIdentitySchema", () => {
  it("accepts identity with only required name", () => {
    const result = characterIdentitySchema.parse({ name: "Solo" });
    expect(result.name).toBe("Solo");
  });

  it("accepts full identity with all optional fields", () => {
    const result = characterIdentitySchema.parse({
      name: "Evelyn Cross",
      pronouns: "she/her",
      concept: "A former spy",
      weapon: { name: "Stiletto", concealed: true },
      instrument: { name: "Skeleton keys", concealed: true },
    });
    expect(result.name).toBe("Evelyn Cross");
    expect(result.weapon?.name).toBe("Stiletto");
  });

  it("rejects missing name", () => {
    expect(() =>
      characterIdentitySchema.parse({ pronouns: "they/them" }),
    ).toThrow();
  });

  it("rejects weapon missing concealed field", () => {
    expect(() =>
      characterIdentitySchema.parse({
        name: "Alice",
        weapon: { name: "Sword" },
      }),
    ).toThrow();
  });
});
