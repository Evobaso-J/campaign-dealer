import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";
import type { CharacterSheet } from "~~/shared/types/character";

import { getAIProvider } from "~~/server/services/ai/index";
import handler from "~~/server/api/campaign/script.post";

// --- Mocks ---

vi.mock("~~/server/services/ai/anthropic", () => ({}));
vi.mock("~~/server/services/ai/ollama", () => ({}));

const mockComplete = vi.fn();
vi.mock("~~/server/services/ai/index", () => ({
  getAIProvider: vi.fn(),
}));

vi.mock("~~/server/services/ai/prompts/script", () => ({
  buildScriptPrompt: vi.fn(() => ({ system: "sys", user: "usr" })),
}));

const mockReadBody = vi.hoisted(() => vi.fn());
vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return { ...actual, readBody: mockReadBody };
});

// --- Fixtures ---

const fakeCharacter = (): CharacterSheet => ({
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
  characterIdentity: {
    name: "Evelyn Cross" as GeneratedText,
  },
});

const validScriptJson = JSON.stringify({
  hook: "The neon streets of Neo-Tokyo hide a dark secret.",
  targets: {
    king: {
      name: "Director Kain",
      description: "Head of the Diamond Corporation",
    },
    queen: {
      name: "Lady Vex",
      description: "Chief of intelligence operations",
    },
    jack: {
      name: "Cipher",
      description: "The corporation's master enforcer",
    },
  },
  weakPoints: [
    { name: "Rat", role: "Informant" },
    { name: "Server Farm", role: "Data center" },
    { name: "Dr. Sato", role: "Reluctant scientist" },
    { name: "The Docks", role: "Smuggling route" },
    { name: "Agent Null", role: "Double agent" },
    { name: "Power Grid", role: "Infrastructure weakness" },
    { name: "Old Guard", role: "Disgruntled veteran" },
    { name: "Media Leak", role: "PR vulnerability" },
    { name: "Supply Chain", role: "Logistics bottleneck" },
    { name: "Vault 7", role: "Secret archive" },
  ],
  scenes: ["Scene 1: The heist begins", "Scene 2: Betrayal", "Scene 3: Showdown"],
  centralTension: "The revolutionaries must choose between justice and revenge.",
  plot: "A sprawling campaign across the neon-lit underworld.",
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
  vi.mocked(getAIProvider).mockReturnValue({
    complete: mockComplete,
    stream: vi.fn(),
  } as unknown as ReturnType<typeof getAIProvider>);
});

describe("POST /api/campaign/script", () => {
  describe("request validation (422)", () => {
    it("throws 422 when characters is missing", async () => {
      mockReadBody.mockResolvedValue({ setting: ["cyberpunk"], language: "en" });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("throws 422 when characters is empty", async () => {
      mockReadBody.mockResolvedValue({
        characters: [],
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
        characters: [fakeCharacter()],
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
        characters: [fakeCharacter()],
        setting: ["cyberpunk"],
      });
      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 422);
        return true;
      });
    });

    it("includes Zod issues in error data", async () => {
      mockReadBody.mockResolvedValue({
        characters: [],
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
    it("throws 502 when getAIProvider throws", async () => {
      mockReadBody.mockResolvedValue({
        characters: [fakeCharacter()],
        setting: ["cyberpunk"],
        language: "en",
      });
      vi.mocked(getAIProvider).mockImplementation(() => {
        throw new Error("AI provider is not configured");
      });

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
    });

    it("throws 502 when provider.complete rejects", async () => {
      mockReadBody.mockResolvedValue({
        characters: [fakeCharacter()],
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
        characters: [fakeCharacter()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: "I cannot generate a script" as GeneratedText,
      });

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("throws 502 when AI JSON is missing required fields", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockReadBody.mockResolvedValue({
        characters: [fakeCharacter()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: JSON.stringify({ hook: "A story begins" }) as GeneratedText,
      });

      await expect(callHandler()).rejects.toSatisfy((e: unknown) => {
        expectError(e, 502);
        return true;
      });
    });
  });

  describe("happy path", () => {
    it("returns GameMasterScript for valid input", async () => {
      mockReadBody.mockResolvedValue({
        characters: [fakeCharacter()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: validScriptJson as GeneratedText,
      });

      const result = await callHandler();
      expect(result.hook).toBe(
        "The neon streets of Neo-Tokyo hide a dark secret.",
      );
      expect(result.targets.king.name).toBe("Director Kain");
      expect(result.targets.queen.name).toBe("Lady Vex");
      expect(result.targets.jack.name).toBe("Cipher");
      expect(result.weakPoints).toHaveLength(10);
      expect(result.scenes).toHaveLength(3);
      expect(result.centralTension).toBeDefined();
      expect(result.plot).toBeDefined();
    });

    it("calls provider.complete exactly once", async () => {
      mockReadBody.mockResolvedValue({
        characters: [fakeCharacter()],
        setting: ["cyberpunk"],
        language: "en",
      });
      mockComplete.mockResolvedValue({
        text: validScriptJson as GeneratedText,
      });

      await callHandler();
      expect(mockComplete).toHaveBeenCalledTimes(1);
    });
  });
});
