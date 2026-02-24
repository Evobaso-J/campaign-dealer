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
    it("returns error if ai.provider is not set", () => {
      mockUseRuntimeConfig.mockReturnValue({ ai: {} });
      const result = getAIProvider();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("AI provider is not configured");
      }
    });
  });

  describe("when API key is missing", () => {
    it("returns error with a message referencing the provider name", () => {
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "anthropic" },
      });
      const result = getAIProvider();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("no API key was provided");
      }
    });
  });

  describe("when ollamaHost is missing for ollama provider", () => {
    it("returns error with a message referencing the host", () => {
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "ollama" },
      });
      const result = getAIProvider();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("no host was provided");
      }
    });
  });

  describe("when ollama provider is properly configured", () => {
    it("does not require apiKey when ollamaHost is provided", () => {
      registerProvider("ollama", () => createMockProvider());
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "ollama", ollamaHost: "http://127.0.0.1:11434" },
      });

      const result = getAIProvider();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeDefined();
        expect(result.value.complete).toBeDefined();
      }
    });
  });

  describe("when provider name is invalid", () => {
    it("returns error listing valid options", () => {
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "gemini", apiKey: "test-key" },
      });
      const result = getAIProvider();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid AI provider "gemini"');
      }
    });
  });

  describe("when properly configured", () => {
    it("returns an AIProvider instance", () => {
      registerProvider("anthropic", () => createMockProvider());
      mockUseRuntimeConfig.mockReturnValue({
        ai: { provider: "anthropic", apiKey: "test-key" },
      });

      const result = getAIProvider();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeDefined();
        expect(result.value.complete).toBeDefined();
        expect(result.value.stream).toBeDefined();
      }
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

    const result = getAIProvider();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(mockProvider);
    }
  });
});
