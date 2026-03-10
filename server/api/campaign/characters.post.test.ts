import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";
import type { CharacterTemplate } from "~~/shared/utils/characterRandomizer";
import {
  suitCharacterizations,
  archetypeCharacterizations,
} from "~~/server/data/houseDoesntWin/characterTemplates";
import { AIProviderError, ok, err } from "~~/shared/types/errors";

import { getAIProvider } from "~~/server/services/ai/index";
import handler from "~~/server/api/campaign/characters.post";

// --- Mocks ---

vi.mock("~~/server/services/ai/anthropic", () => ({}));
vi.mock("~~/server/services/ai/ollama", () => ({}));

const mockComplete = vi.fn();
vi.mock("~~/server/services/ai/index", () => ({
  getAIProvider: vi.fn(),
}));

vi.mock("~~/server/services/ai/prompts/character", () => ({
  buildCharacterPrompt: vi.fn(() => ({ system: "sys", user: "usr" })),
}));

const mockReadBody = vi.hoisted(() => vi.fn());
vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return { ...actual, readBody: mockReadBody };
});

// --- Fixtures ---

const fakeTemplate = (
  overrides?: Partial<CharacterTemplate>,
): CharacterTemplate => ({
  archetype: "king" as const,
  suit: "hearts" as const,
  damage: { hearts: false, clubs: false, spades: false },
  modifiers: { hearts: -1, clubs: 1, spades: 0 },
  suitSkill: {
    name: "skill.king.hearts" as I18nKey,
    description: "skill.king.hearts.desc" as I18nKey,
  },
  archetypeSkills: [
    {
      name: "skill.king.1" as I18nKey,
      description: "skill.king.1.desc" as I18nKey,
    },
  ],
  suitCharacterization: suitCharacterizations.hearts,
  archetypeCharacterization: archetypeCharacterizations.king,
  ...overrides,
});

const validIdentityJson = JSON.stringify({
  name: "Evelyn Cross",
  pronouns: "she/her",
  concept: "A former Diamond spy turned rebel",
  weapon: { name: "Stiletto", concealed: true },
  instrument: { name: "Skeleton key set", concealed: true },
});

// --- Helpers ---

const fakeEvent = {} as Parameters<typeof handler>[0];

function callHandler() {
  return handler(fakeEvent);
}

function expectError(error: unknown, statusCode: number) {
  expect(error).toBeDefined();
  expect((error as { statusCode: number }).statusCode).toBe(statusCode);
}

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();
  // Reset getAIProvider to default: returns ok with a mock provider
  vi.mocked(getAIProvider).mockReturnValue(
    ok({
      complete: mockComplete,
      stream: vi.fn(),
    }) as ReturnType<typeof getAIProvider>,
  );
});

describe("POST /api/campaign/characters", () => {
  describe("request validation (422)", () => {
    it("throws 422 when templates is missing", async () => {
      mockReadBody.mockResolvedValue({
        setting: ["cyberpunk"],
        language: "en",
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("throws 422 when templates is empty", async () => {
      mockReadBody.mockResolvedValue({
        templates: [],
        setting: ["cyberpunk"],
        language: "en",
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("throws 422 when templates exceeds max (4)", async () => {
      mockReadBody.mockResolvedValue({
        templates: [
          fakeTemplate({ archetype: "king", suit: "hearts" }),
          fakeTemplate({ archetype: "queen", suit: "hearts" }),
          fakeTemplate({ archetype: "jack", suit: "hearts" }),
          fakeTemplate({ archetype: "king", suit: "clubs" }),
          fakeTemplate({ archetype: "queen", suit: "clubs" }),
        ],
        setting: ["cyberpunk"],
        language: "en",
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("throws 422 when templates contain duplicate archetype-suit pairs", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate(), fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("throws 422 when setting is empty", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: [],
        language: "en",
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("throws 422 when language is missing", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("includes Zod issues in error data", async () => {
      mockReadBody.mockResolvedValue({
        templates: [],
        setting: [],
        language: "en",
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        const error = e as { statusCode: number; data: unknown[] };
        expect(error.statusCode).toBe(422);
        expect(Array.isArray(error.data)).toBe(true);
        expect(error.data.length).toBeGreaterThan(0);
        return true;
      });
    });
  });

  describe("AI provider failure (502)", () => {
    it("throws 502 when getAIProvider returns error", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      vi.mocked(getAIProvider).mockReturnValue(
        err(new AIProviderError("AI provider is not configured")),
      );

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
    });

    it("throws 502 when provider.complete rejects", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockRejectedValue(new Error("network error"));

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
    });
  });

  describe("AI response parsing (502)", () => {
    it("throws 502 when AI returns non-JSON text", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: "I cannot generate characters" as GeneratedText,
      });

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("throws 502 when AI JSON is missing required name field", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: JSON.stringify({ pronouns: "they/them" }) as GeneratedText,
      });

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
    });

    it("throws 502 when weapon is malformed", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: JSON.stringify({
          name: "Alice",
          weapon: "sword",
        }) as GeneratedText,
      });

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
    });
  });

  describe("happy path", () => {
    it("returns CharacterSheet[] for a single template", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: validIdentityJson as GeneratedText,
      });

      const result = await callHandler();
      expect(result).toHaveLength(1);
      expect(result[0]!.characterIdentity.name).toBe("Evelyn Cross");
    });

    it("merges template fields into the returned CharacterSheet", async () => {
      const template = fakeTemplate();
      mockReadBody.mockResolvedValue({
        templates: [template],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: validIdentityJson as GeneratedText,
      });

      const result = await callHandler();
      const sheet = result[0]!;
      expect(sheet.archetype).toBe(template.archetype);
      expect(sheet.suit).toBe(template.suit);
      expect(sheet.damage).toEqual(template.damage);
      expect(sheet.modifiers).toEqual(template.modifiers);
      expect(sheet.suitSkill).toEqual(template.suitSkill);
      expect(sheet.archetypeSkills).toEqual(template.archetypeSkills);
    });

    it("runs AI completions in parallel for multiple templates", async () => {
      const templates = [
        fakeTemplate({ archetype: "king" as const, suit: "hearts" as const }),
        fakeTemplate({ archetype: "queen" as const, suit: "clubs" as const }),
        fakeTemplate({ archetype: "jack" as const, suit: "spades" as const }),
      ];
      mockReadBody.mockResolvedValue({
        templates,
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: validIdentityJson as GeneratedText,
      });

      const result = await callHandler();
      expect(result).toHaveLength(3);
      expect(mockComplete).toHaveBeenCalledTimes(3);
    });

    it("accepts minimal identity with only name", async () => {
      mockReadBody.mockResolvedValue({
        templates: [fakeTemplate()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: JSON.stringify({ name: "Solo" }) as GeneratedText,
      });

      const result = await callHandler();
      expect(result[0]!.characterIdentity.name).toBe("Solo");
    });
  });
});
