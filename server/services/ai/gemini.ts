import { GoogleGenAI } from "@google/genai";
import type { GeneratedText } from "~~/shared/types/utils";
import type {
  AICompletionResult,
  AIPrompt,
  AIProvider,
  AIRuntimeConfig,
} from "./types";

const DEFAULT_MODEL = "gemini-2.0-flash";
const MAX_TOKENS = 4096;
const MODEL_TEMPERATURE = 1.5;

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(config: AIRuntimeConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || DEFAULT_MODEL;
  }

  async complete(prompt: AIPrompt): Promise<AICompletionResult> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt.user,
      config: {
        systemInstruction: prompt.system,
        temperature: MODEL_TEMPERATURE,
        maxOutputTokens: MAX_TOKENS,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";

    return { text: text as GeneratedText };
  }

  async *stream(prompt: AIPrompt): AsyncIterable<GeneratedText> {
    const response = await this.client.models.generateContentStream({
      model: this.model,
      contents: prompt.user,
      config: {
        systemInstruction: prompt.system,
        temperature: MODEL_TEMPERATURE,
        maxOutputTokens: MAX_TOKENS,
        responseMimeType: "application/json",
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text as GeneratedText;
      }
    }
  }
}
