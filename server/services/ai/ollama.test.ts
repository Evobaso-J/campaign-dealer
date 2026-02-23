import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText } from "~~/shared/types/utils";
import type { AIRuntimeConfig } from "./index";
import { OllamaProvider } from "./ollama";

const { mockChat, MockOllama } = vi.hoisted(() => {
  const mockChat = vi.fn();
  const MockOllama = vi.fn(function () {
    return { chat: mockChat };
  });
  return { mockChat, MockOllama };
});

vi.mock("ollama", () => ({ Ollama: MockOllama }));

const baseConfig: AIRuntimeConfig = {
  provider: "ollama",
  ollamaHost: "http://127.0.0.1:11434",
};

afterEach(() => {
  mockChat.mockReset();
  MockOllama.mockClear();
});

describe("OllamaProvider", () => {
  describe("constructor", () => {
    it("creates client with the provided host", () => {
      new OllamaProvider(baseConfig);
      expect(MockOllama).toHaveBeenCalledWith({
        host: "http://127.0.0.1:11434",
      });
    });
  });

  describe("complete", () => {
    it("sends system and user messages to the API", async () => {
      mockChat.mockResolvedValue({
        message: { content: "Generated character" },
      });

      const provider = new OllamaProvider(baseConfig);
      await provider.complete({
        system: "You are a GM.",
        user: "Create a character.",
      });

      expect(mockChat).toHaveBeenCalledWith({
        model: "llama3.1",
        stream: false,
        messages: [
          { role: "system", content: "You are a GM." },
          { role: "user", content: "Create a character." },
        ],
      });
    });

    it("returns text from the response message", async () => {
      mockChat.mockResolvedValue({
        message: { content: "Hello world" },
      });

      const provider = new OllamaProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("Hello world");
    });

    it("uses a custom model when configured", async () => {
      mockChat.mockResolvedValue({
        message: { content: "ok" },
      });

      const config: AIRuntimeConfig = {
        ...baseConfig,
        model: "mistral",
      };
      const provider = new OllamaProvider(config);
      await provider.complete({ system: "sys", user: "usr" });

      expect(mockChat).toHaveBeenCalledWith(
        expect.objectContaining({ model: "mistral" }),
      );
    });

    it("returns empty string when content is undefined", async () => {
      mockChat.mockResolvedValue({
        message: { content: undefined },
      });

      const provider = new OllamaProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("");
    });

    it("returns empty string when content is null", async () => {
      mockChat.mockResolvedValue({
        message: { content: null },
      });

      const provider = new OllamaProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("");
    });

    it("propagates API errors", async () => {
      mockChat.mockRejectedValue(new Error("Connection refused"));

      const provider = new OllamaProvider(baseConfig);
      await expect(
        provider.complete({ system: "sys", user: "usr" }),
      ).rejects.toThrow("Connection refused");
    });
  });

  describe("stream", () => {
    it("yields text chunks from the stream", async () => {
      const chunks = [
        { message: { content: "Hello" } },
        { message: { content: " world" } },
      ];

      mockChat.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) yield chunk;
        },
      });

      const provider = new OllamaProvider(baseConfig);
      const received: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        received.push(chunk);
      }

      expect(received).toEqual(["Hello", " world"]);
    });

    it("skips empty content chunks", async () => {
      const chunks = [
        { message: { content: "" } },
        { message: { content: "data" } },
        { message: { content: "" } },
      ];

      mockChat.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) yield chunk;
        },
      });

      const provider = new OllamaProvider(baseConfig);
      const received: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        received.push(chunk);
      }

      expect(received).toEqual(["data"]);
    });

    it("passes correct parameters to the streaming API", async () => {
      mockChat.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          // empty stream
        },
      });

      const provider = new OllamaProvider(baseConfig);
      for await (const _ of provider.stream({
        system: "Stream system",
        user: "Stream user",
      })) {
        void _;
      }

      expect(mockChat).toHaveBeenCalledWith({
        model: "llama3.1",
        stream: true,
        messages: [
          { role: "system", content: "Stream system" },
          { role: "user", content: "Stream user" },
        ],
      });
    });
  });

});
