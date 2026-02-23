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
    // Assistant prefill: by ending the messages array with an assistant turn
    // that starts with "{", we force Claude to continue from that character.
    // The model cannot produce any prose before the JSON — it is already
    // mid-object. The API returns only the continuation (without the "{"),
    // so we prepend it manually to reconstruct the full JSON string.
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      temperature: 1.0,
      system: prompt.system,
      messages: [
        { role: "user", content: prompt.user },
        { role: "assistant", content: "{" },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return { text: ("{" + text) as GeneratedText };
  }

  async *stream(prompt: AIPrompt): AsyncIterable<GeneratedText> {
    // Same prefill technique as complete() — see comment above.
    // Yield "{" immediately so the consumer receives the full JSON from the start.
    yield "{" as GeneratedText;

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: MAX_TOKENS,
      temperature: 1.0,
      system: prompt.system,
      messages: [
        { role: "user", content: prompt.user },
        { role: "assistant", content: "{" },
      ],
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
