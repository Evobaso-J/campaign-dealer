import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText } from "~~/shared/types/utils";
import {
  getAIProvider,
  registerProvider,
  type AIProvider,
  type AIRuntimeConfig,
} from "~~/server/services/ai/index";

// vi.hoisted runs before imports, so useRuntimeConfig is available
// when the module under test is loaded.
const mockUseRuntimeConfig = vi.hoisted(() => vi.fn());
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

const createMockProvider = (): AIProvider => ({
  complete: vi
    .fn()
    .mockResolvedValue({ text: "mock response" as GeneratedText }),
  async *stream() {
    yield "chunk" as GeneratedText;
  },
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAIProvider", () => {
  describe("when AI config is missing", () => {
    it("throws if ai.provider is not set", () => {
      mockUseRuntimeConfig.mockReturnValue({ ai: {} });
      expect(() => getAIProvider()).toThrow("AI provider is not configured");
    });
  });

  describe("when API key is missing", () => {
    it("throws with a message referencing the provider name", () => {
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "anthropic" },
      });
      expect(() => getAIProvider()).toThrow("no API key was provided");
    });
  });

  describe("when provider name is invalid", () => {
    it("throws listing valid options", () => {
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "openai", apiKey: "test-key" },
      });
      expect(() => getAIProvider()).toThrow(
        'Invalid AI provider "openai"',
      );
    });
  });

  describe("when properly configured", () => {
    it("returns an AIProvider instance", () => {
      registerProvider("anthropic", () => createMockProvider());
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "anthropic", apiKey: "test-key" },
      });

      const provider = getAIProvider();
      expect(provider).toBeDefined();
      expect(provider.complete).toBeDefined();
      expect(provider.stream).toBeDefined();
    });

    it("passes config to the provider factory", () => {
      const factoryFn = vi.fn().mockReturnValue(createMockProvider());
      registerProvider("anthropic", factoryFn);

      const config: AIRuntimeConfig = {
        provider: "anthropic",
        apiKey: "sk-test-123",
        model: "claude-sonnet-4-20250514",
      };
      mockUseRuntimeConfig.mockReturnValue({ ai: config });

      getAIProvider();
      expect(factoryFn).toHaveBeenCalledWith(config);
    });
  });
});

describe("registerProvider", () => {
  it("allows registering a provider that getAIProvider can resolve", () => {
    const mockProvider = createMockProvider();
    registerProvider("anthropic", () => mockProvider);

    mockUseRuntimeConfig.mockReturnValue({
      ai: { provider: "anthropic", apiKey: "test-key" },
    });

    const provider = getAIProvider();
    expect(provider).toBe(mockProvider);
  });
});
