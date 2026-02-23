import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedText } from "~~/shared/types/utils";
import type {
  AICompletionResult,
  AIPrompt,
  AIProvider,
  AIRuntimeConfig,
} from "./index";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: AIRuntimeConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || DEFAULT_MODEL;
  }

  async complete(prompt: AIPrompt): Promise<AICompletionResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return { text: text as GeneratedText };
  }

  async *stream(prompt: AIPrompt): AsyncIterable<GeneratedText> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text as GeneratedText;
      }
    }
  }
}
