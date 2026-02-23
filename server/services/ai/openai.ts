import OpenAI from "openai";
import type { GeneratedText } from "~~/shared/types/utils";
import type {
  AICompletionResult,
  AIPrompt,
  AIProvider,
  AIRuntimeConfig,
} from "./index";

const DEFAULT_MODEL = "gpt-4o";
const MAX_TOKENS = 4096;
const MODEL_TEMPERATURE = 1.5;

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: AIRuntimeConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || DEFAULT_MODEL;
  }

  async complete(prompt: AIPrompt): Promise<AICompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      temperature: MODEL_TEMPERATURE,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    });

    const text = response.choices[0]?.message.content ?? "";

    return { text: text as GeneratedText };
  }

  async *stream(prompt: AIPrompt): AsyncIterable<GeneratedText> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      temperature: MODEL_TEMPERATURE,
      stream: true,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content as GeneratedText;
      }
    }
  }
}
