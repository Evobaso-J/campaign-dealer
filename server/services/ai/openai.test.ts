import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText } from "~~/shared/types/utils";
import type { AIRuntimeConfig } from "./index";
import { OpenAIProvider } from "./openai";

const { mockCreate, MockOpenAI } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const MockOpenAI = vi.fn(function () {
    return { chat: { completions: { create: mockCreate } } };
  });
  return { mockCreate, MockOpenAI };
});

vi.mock("openai", () => ({ default: MockOpenAI }));

const baseConfig: AIRuntimeConfig = {
  provider: "openai",
  apiKey: "sk-test-key",
};

afterEach(() => {
  mockCreate.mockReset();
  MockOpenAI.mockClear();
});

describe("OpenAIProvider", () => {
  describe("constructor", () => {
    it("creates client with the provided API key", () => {
      new OpenAIProvider(baseConfig);
      expect(MockOpenAI).toHaveBeenCalledWith({ apiKey: "sk-test-key" });
    });
  });

  describe("complete", () => {
    it("sends system and user messages to the API", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{"name":"Test"}' } }],
      });

      const provider = new OpenAIProvider(baseConfig);
      await provider.complete({
        system: "You are a GM.",
        user: "Create a character.",
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4o",
        max_tokens: 4096,
        temperature: 1.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a GM." },
          { role: "user", content: "Create a character." },
        ],
      });
    });

    it("returns text from the response", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{"name":"Hero"}' } }],
      });

      const provider = new OpenAIProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe('{"name":"Hero"}');
    });

    it("returns empty string when content is null", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const provider = new OpenAIProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("");
    });

    it("returns empty string when choices are empty", async () => {
      mockCreate.mockResolvedValue({ choices: [] });

      const provider = new OpenAIProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("");
    });

    it("uses a custom model when configured", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{"ok":true}' } }],
      });

      const config: AIRuntimeConfig = {
        ...baseConfig,
        model: "gpt-4o-mini",
      };
      const provider = new OpenAIProvider(config);
      await provider.complete({ system: "sys", user: "usr" });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: "gpt-4o-mini" }),
      );
    });

    it("propagates API errors", async () => {
      mockCreate.mockRejectedValue(new Error("API rate limit exceeded"));

      const provider = new OpenAIProvider(baseConfig);
      await expect(
        provider.complete({ system: "sys", user: "usr" }),
      ).rejects.toThrow("API rate limit exceeded");
    });
  });

  describe("stream", () => {
    it("yields text deltas from the stream", async () => {
      const chunks = [
        { choices: [{ delta: { content: "Hello" } }] },
        { choices: [{ delta: { content: " world" } }] },
      ];

      mockCreate.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) yield chunk;
        },
      });

      const provider = new OpenAIProvider(baseConfig);
      const collected: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        collected.push(chunk);
      }

      expect(collected).toEqual(["Hello", " world"]);
    });

    it("skips chunks with no content", async () => {
      const chunks = [
        { choices: [{ delta: {} }] },
        { choices: [{ delta: { content: "data" } }] },
        { choices: [{ delta: { content: null } }] },
      ];

      mockCreate.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) yield chunk;
        },
      });

      const provider = new OpenAIProvider(baseConfig);
      const collected: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        collected.push(chunk);
      }

      expect(collected).toEqual(["data"]);
    });

    it("passes correct parameters to the streaming API", async () => {
      mockCreate.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          // empty stream
        },
      });

      const provider = new OpenAIProvider(baseConfig);
      for await (const _ of provider.stream({
        system: "Stream system",
        user: "Stream user",
      })) {
        void _;
      }

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4o",
        max_tokens: 4096,
        temperature: 1.5,
        stream: true,
        messages: [
          { role: "system", content: "Stream system" },
          { role: "user", content: "Stream user" },
        ],
      });
    });
  });
});
