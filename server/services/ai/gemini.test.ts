import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedText } from "~~/shared/types/utils";
import type { AIRuntimeConfig } from "./types";
import { GeminiProvider } from "./gemini";

const { mockGenerateContent, mockGenerateContentStream, MockGoogleGenAI } =
  vi.hoisted(() => {
    const mockGenerateContent = vi.fn();
    const mockGenerateContentStream = vi.fn();
    const MockGoogleGenAI = vi.fn(function () {
      return {
        models: {
          generateContent: mockGenerateContent,
          generateContentStream: mockGenerateContentStream,
        },
      };
    });
    return { mockGenerateContent, mockGenerateContentStream, MockGoogleGenAI };
  });

vi.mock("@google/genai", () => ({ GoogleGenAI: MockGoogleGenAI }));

const baseConfig: AIRuntimeConfig = {
  provider: "gemini",
  apiKey: "test-gemini-key",
};

afterEach(() => {
  mockGenerateContent.mockReset();
  mockGenerateContentStream.mockReset();
  MockGoogleGenAI.mockClear();
});

describe("GeminiProvider", () => {
  describe("constructor", () => {
    it("creates client with the provided API key", () => {
      new GeminiProvider(baseConfig);
      expect(MockGoogleGenAI).toHaveBeenCalledWith({
        apiKey: "test-gemini-key",
      });
    });
  });

  describe("complete", () => {
    it("sends system instruction and user content to the API", async () => {
      mockGenerateContent.mockResolvedValue({ text: '{"name":"Test"}' });

      const provider = new GeminiProvider(baseConfig);
      await provider.complete({
        system: "You are a GM.",
        user: "Create a character.",
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: "gemini-2.0-flash",
        contents: "Create a character.",
        config: {
          systemInstruction: "You are a GM.",
          temperature: 1.5,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });
    });

    it("returns text from the response", async () => {
      mockGenerateContent.mockResolvedValue({ text: '{"name":"Hero"}' });

      const provider = new GeminiProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe('{"name":"Hero"}');
    });

    it("returns empty string when text is null", async () => {
      mockGenerateContent.mockResolvedValue({ text: null });

      const provider = new GeminiProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("");
    });

    it("returns empty string when text is undefined", async () => {
      mockGenerateContent.mockResolvedValue({});

      const provider = new GeminiProvider(baseConfig);
      const result = await provider.complete({ system: "sys", user: "usr" });

      expect(result.text).toBe("");
    });

    it("uses a custom model when configured", async () => {
      mockGenerateContent.mockResolvedValue({ text: '{"ok":true}' });

      const config: AIRuntimeConfig = {
        ...baseConfig,
        model: "gemini-2.5-pro",
      };
      const provider = new GeminiProvider(config);
      await provider.complete({ system: "sys", user: "usr" });

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: "gemini-2.5-pro" }),
      );
    });

    it("propagates API errors", async () => {
      mockGenerateContent.mockRejectedValue(new Error("API quota exceeded"));

      const provider = new GeminiProvider(baseConfig);
      await expect(
        provider.complete({ system: "sys", user: "usr" }),
      ).rejects.toThrow("API quota exceeded");
    });
  });

  describe("stream", () => {
    it("yields text chunks from the stream", async () => {
      const chunks = [{ text: "Hello" }, { text: " world" }];

      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) yield chunk;
        },
      });

      const provider = new GeminiProvider(baseConfig);
      const collected: GeneratedText[] = [];
      for await (const chunk of provider.stream({
        system: "sys",
        user: "usr",
      })) {
        collected.push(chunk);
      }

      expect(collected).toEqual(["Hello", " world"]);
    });

    it("skips chunks with no text", async () => {
      const chunks = [
        { text: "" },
        { text: "data" },
        { text: null },
        { text: undefined },
      ];

      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) yield chunk;
        },
      });

      const provider = new GeminiProvider(baseConfig);
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
      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          // empty stream
        },
      });

      const provider = new GeminiProvider(baseConfig);
      for await (const _ of provider.stream({
        system: "Stream system",
        user: "Stream user",
      })) {
        void _;
      }

      expect(mockGenerateContentStream).toHaveBeenCalledWith({
        model: "gemini-2.0-flash",
        contents: "Stream user",
        config: {
          systemInstruction: "Stream system",
          temperature: 1.5,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });
    });
  });
});
