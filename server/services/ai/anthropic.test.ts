import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText } from "~~/shared/types/utils";
import type { AIRuntimeConfig } from "./index";
import { AnthropicProvider } from "./anthropic";

const { mockCreate, mockStream, MockAnthropic } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const mockStream = vi.fn();
  const MockAnthropic = vi.fn(function () {
    return { messages: { create: mockCreate, stream: mockStream } };
  });
  return { mockCreate, mockStream, MockAnthropic };
});

vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

const baseConfig: AIRuntimeConfig = {
  provider: "anthropic",
  apiKey: "sk-test-key",
};

afterEach(() => {
  mockCreate.mockReset();
  mockStream.mockReset();
  MockAnthropic.mockClear();
});

describe("AnthropicProvider", () => {
  describe("constructor", () => {
    it("creates client with the provided API key", () => {
      new AnthropicProvider(baseConfig);
      expect(MockAnthropic).toHaveBeenCalledWith({ apiKey: "sk-test-key" });
    });
  });

  describe("complete", () => {
    it("sends system and user messages to the API", async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: "Generated character" }],
      });

      const provider = new AnthropicProvider(baseConfig);
      await provider.complete({
        system: "You are a GM.",
        user: "Create a character.",
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 1.0,
        system: "You are a GM.",
        messages: [
          { role: "user", content: "Create a character." },
          { role: "assistant", content: "{" },
        ],
      });
    });

    it("returns text from a single text block", async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: "Hello world" }],
      });

      const provider = new AnthropicProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("{Hello world");
    });

    it("concatenates multiple text blocks", async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: "text", text: "Part 1" },
          { type: "text", text: " Part 2" },
        ],
      });

      const provider = new AnthropicProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("{Part 1 Part 2");
    });

    it("ignores non-text blocks", async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: "tool_use", id: "1", name: "tool", input: {} },
          { type: "text", text: "Only text" },
        ],
      });

      const provider = new AnthropicProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("{Only text");
    });

    it("returns only the prefill when no text blocks are present", async () => {
      mockCreate.mockResolvedValue({ content: [] });

      const provider = new AnthropicProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("{");
    });

    it("uses a custom model when configured", async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: "ok" }],
      });

      const config: AIRuntimeConfig = {
        ...baseConfig,
        model: "claude-opus-4-20250514",
      };
      const provider = new AnthropicProvider(config);
      await provider.complete({ system: "sys", user: "usr" });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: "claude-opus-4-20250514" }),
      );
    });

    it("propagates API errors", async () => {
      mockCreate.mockRejectedValue(new Error("API rate limit exceeded"));

      const provider = new AnthropicProvider(baseConfig);
      await expect(
        provider.complete({ system: "sys", user: "usr" }),
      ).rejects.toThrow("API rate limit exceeded");
    });
  });

  describe("stream", () => {
    it("yields text deltas from the stream", async () => {
      const events = [
        {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "Hello" },
        },
        {
          type: "content_block_delta",
          delta: { type: "text_delta", text: " world" },
        },
      ];

      mockStream.mockReturnValue({
        async *[Symbol.asyncIterator]() {
          for (const event of events) yield event;
        },
      });

      const provider = new AnthropicProvider(baseConfig);
      const chunks: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["{", "Hello", " world"]);
    });

    it("skips non-text-delta events", async () => {
      const events = [
        { type: "message_start", message: {} },
        {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "data" },
        },
        { type: "content_block_stop", index: 0 },
        { type: "message_stop" },
      ];

      mockStream.mockReturnValue({
        async *[Symbol.asyncIterator]() {
          for (const event of events) yield event;
        },
      });

      const provider = new AnthropicProvider(baseConfig);
      const chunks: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["{", "data"]);
    });

    it("passes correct parameters to the streaming API", async () => {
      mockStream.mockReturnValue({
        async *[Symbol.asyncIterator]() {
          // empty stream
        },
      });

      const provider = new AnthropicProvider(baseConfig);
      for await (const _ of provider.stream({
        system: "Stream system",
        user: "Stream user",
      })) {
        void _;
      }

      expect(mockStream).toHaveBeenCalledWith({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 1.0,
        system: "Stream system",
        messages: [
          { role: "user", content: "Stream user" },
          { role: "assistant", content: "{" },
        ],
      });
    });
  });
});
