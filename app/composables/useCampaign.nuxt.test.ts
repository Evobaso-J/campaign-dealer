import { describe, it, expect } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import type { CharacterSheet } from "~~/shared/types/character";
import type { CharacterTemplate } from "~~/shared/utils/characterRandomizer";
import type { GameMasterScript } from "~~/shared/types/campaign";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";
import {
  suitCharacterizations,
  archetypeCharacterizations,
} from "~~/server/data/houseDoesntWin/characterTemplates";

// --- Fixtures ---

function gt(s: string): GeneratedText {
  return s as GeneratedText;
}

const mockCharacter: CharacterSheet = {
  archetype: "king",
  suit: "hearts",
  damage: { hearts: false, clubs: false, spades: false },
  modifiers: { hearts: 0, clubs: 0, spades: 0 },
  suitSkill: {
    name: "skill.hearts.king.name" as I18nKey,
    description: "skill.hearts.king.desc" as I18nKey,
  },
  characterIdentity: { name: gt("Test Character") },
  archetypeSkills: [],
};

const mockScript: GameMasterScript = {
  hook: gt("A dark force rises"),
  targets: {
    king: { name: gt("King Enemy"), description: gt("Desc") },
    queen: { name: gt("Queen Enemy"), description: gt("Desc") },
    jack: { name: gt("Jack Enemy"), description: gt("Desc") },
  },
  weakPoints: [{ name: gt("Weak Point"), role: gt("Role") }],
  scenes: [gt("Scene 1")],
  centralTension: gt("Central tension"),
  plot: gt("The plot"),
};

const mockTemplate: CharacterTemplate = {
  archetype: "king",
  suit: "hearts",
  damage: { hearts: false, clubs: false, spades: false },
  modifiers: { hearts: 0, clubs: 0, spades: 0 },
  suitSkill: {
    name: "skill.hearts.king.name" as I18nKey,
    description: "skill.hearts.king.desc" as I18nKey,
  },
  archetypeSkills: [],
  suitCharacterization: suitCharacterizations.hearts,
  archetypeCharacterization: archetypeCharacterizations.king,
};

// --- Tests ---

describe("useCampaign", () => {
  it("generates characters and stores them", async () => {
    registerEndpoint("/api/campaign/characters", {
      method: "POST",
      handler: () => [mockCharacter],
    });

    const { generateCharacters } = useCampaign();
    const store = useCampaignStore();

    expect(store.generationStatus).toBe("idle");

    await generateCharacters([mockTemplate], ["cyberpunk"]);

    expect(store.characters).toEqual([mockCharacter]);
    expect(store.generationStatus).toBe("characters-ready");
    expect(store.isLoading).toBe(false);
  });

  it("generates script and completes the campaign", async () => {
    registerEndpoint("/api/campaign/characters", {
      method: "POST",
      handler: () => [mockCharacter],
    });
    registerEndpoint("/api/campaign/script", {
      method: "POST",
      handler: () => mockScript,
    });

    const { generateCharacters, generateScript } = useCampaign();
    const store = useCampaignStore();

    await generateCharacters([mockTemplate], ["cyberpunk"]);
    await generateScript();

    expect(store.generationStatus).toBe("done");
    expect(store.characters).toEqual([mockCharacter]);
    expect(store.gmScript).toEqual(mockScript);
    expect(store.isLoading).toBe(false);
    expect(store.hasResult).toBe(true);
  });

  it("transitions to error when character generation fails", async () => {
    registerEndpoint("/api/campaign/characters", {
      method: "POST",
      handler: () => {
        throw createError({
          statusCode: 422,
          statusMessage: "Validation failed",
        });
      },
    });

    const { generateCharacters } = useCampaign();
    const store = useCampaignStore();

    await generateCharacters([mockTemplate], ["cyberpunk"]);

    expect(store.generationStatus).toBe("error");
    expect(store.errorMessage).toBeTruthy();
    expect(store.characters).toEqual([]);
  });

  it("transitions to error when script generation fails but keeps characters", async () => {
    registerEndpoint("/api/campaign/characters", {
      method: "POST",
      handler: () => [mockCharacter],
    });
    registerEndpoint("/api/campaign/script", {
      method: "POST",
      handler: () => {
        throw createError({
          statusCode: 502,
          statusMessage: "AI service error",
        });
      },
    });

    const { generateCharacters, generateScript } = useCampaign();
    const store = useCampaignStore();

    await generateCharacters([mockTemplate], ["cyberpunk"]);
    await generateScript();

    expect(store.generationStatus).toBe("error");
    expect(store.errorMessage).toBeTruthy();
    expect(store.characters).toEqual([mockCharacter]);
  });

  it("throws when generateScript is called with no characters", async () => {
    const { generateScript } = useCampaign();
    const store = useCampaignStore();
    store.reset();

    await expect(generateScript()).rejects.toThrow();
  });

  it("resets store back to idle", async () => {
    registerEndpoint("/api/campaign/characters", {
      method: "POST",
      handler: () => [mockCharacter],
    });
    registerEndpoint("/api/campaign/script", {
      method: "POST",
      handler: () => mockScript,
    });

    const { generateCharacters, generateScript } = useCampaign();
    const store = useCampaignStore();

    await generateCharacters([mockTemplate], ["cyberpunk"]);
    await generateScript();
    expect(store.hasResult).toBe(true);

    store.reset();

    expect(store.generationStatus).toBe("idle");
    expect(store.characters).toEqual([]);
    expect(store.gmScript).toBeUndefined();
    expect(store.isLoading).toBe(false);
    expect(store.hasResult).toBe(false);
  });
});
