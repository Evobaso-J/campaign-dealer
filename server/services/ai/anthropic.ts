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
const TOOL_NAME = "generate_json";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: AIRuntimeConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || DEFAULT_MODEL;
  }

  async complete(prompt: AIPrompt): Promise<AICompletionResult> {
    if (prompt.jsonSchema) {
      return this.completeWithToolUse(prompt, prompt.jsonSchema);
    }
    return this.completeWithPrefill(prompt);
  }

  async *stream(prompt: AIPrompt): AsyncIterable<GeneratedText> {
    if (prompt.jsonSchema) {
      yield* this.streamWithToolUse(prompt, prompt.jsonSchema);
    } else {
      yield* this.streamWithPrefill(prompt);
    }
  }

  /** Use tool_use to constrain output to a JSON schema while keeping creative temperature. */
  private async completeWithToolUse(
    prompt: AIPrompt,
    jsonSchema: Record<string, unknown>,
  ): Promise<AICompletionResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      temperature: 1.0,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      tools: [
        {
          name: TOOL_NAME,
          description: "Generate structured JSON output",
          input_schema: jsonSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    });

    const toolBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (!toolBlock) {
      throw new Error("Expected tool_use block in response");
    }

    return { text: JSON.stringify(toolBlock.input) as GeneratedText };
  }

  /** Fallback: assistant prefill technique for prompts without a JSON schema. */
  private async completeWithPrefill(
    prompt: AIPrompt,
  ): Promise<AICompletionResult> {
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

  /** Stream tool_use output via input_json_delta events. */
  private async *streamWithToolUse(
    prompt: AIPrompt,
    jsonSchema: Record<string, unknown>,
  ): AsyncIterable<GeneratedText> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: MAX_TOKENS,
      temperature: 1.0,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      tools: [
        {
          name: TOOL_NAME,
          description: "Generate structured JSON output",
          input_schema: jsonSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "input_json_delta"
      ) {
        yield event.delta.partial_json as GeneratedText;
      }
    }
  }

  /** Fallback: stream with assistant prefill. */
  private async *streamWithPrefill(
    prompt: AIPrompt,
  ): AsyncIterable<GeneratedText> {
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
