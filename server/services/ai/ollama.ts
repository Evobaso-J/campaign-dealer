import { Ollama } from "ollama";
import type { GeneratedText } from "~~/shared/types/utils";
import type {
  AICompletionResult,
  AIPrompt,
  AIProvider,
  AIRuntimeConfig,
} from "./index";

const DEFAULT_MODEL = "llama3.1";
const MODEL_TEMPERATURE = 1.5;

export class OllamaProvider implements AIProvider {
  private client: Ollama;
  private model: string;

  constructor(config: AIRuntimeConfig) {
    this.client = new Ollama({ host: config.ollamaHost });
    this.model = config.model || DEFAULT_MODEL;
  }

  async complete(prompt: AIPrompt): Promise<AICompletionResult> {
    const response = await this.client.chat({
      model: this.model,
      stream: false,
      format: "json",
      options: { temperature: MODEL_TEMPERATURE },
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    });

    const text = response.message.content ?? "";

    return { text: text as GeneratedText };
  }

  async *stream(prompt: AIPrompt): AsyncIterable<GeneratedText> {
    const response = await this.client.chat({
      model: this.model,
      stream: true,
      options: { temperature: MODEL_TEMPERATURE },
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    });

    for await (const chunk of response) {
      if (chunk.message.content) {
        yield chunk.message.content as GeneratedText;
      }
    }
  }
}
