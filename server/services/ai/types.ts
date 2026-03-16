import type { GeneratedText } from "~~/shared/types/utils";

/**
 * The shape returned by prompt builders in `server/services/ai/prompts/`.
 * Each prompt builder takes typed domain inputs and returns system + user
 * strings that are provider-agnostic.
 */
export interface AIPrompt {
  system: string;
  user: string;
  /** JSON Schema for structured output. Providers that support it (e.g. Anthropic
   *  tool_use) will constrain the response to match this schema. Others ignore it. */
  jsonSchema?: Record<string, unknown>;
}

/**
 * The result of a one-shot completion call.
 * Uses the GeneratedText branded type to mark text as AI-generated,
 * matching the convention in CharacterIdentity and GameMasterScript.
 */
export interface AICompletionResult {
  text: GeneratedText;
}

/**
 * Contract that every AI provider must implement.
 *
 * Adding a new provider means creating a new file that exports a class
 * (or factory) satisfying this interface — no other code changes required.
 */
export interface AIProvider {
  /**
   * Send a one-shot prompt and receive the full response.
   * Used for character identity generation and GM script generation.
   */
  complete(prompt: AIPrompt): Promise<AICompletionResult>;

  /**
   * Send a prompt and receive a streaming response.
   * Reserved for future SSE endpoint support.
   * Yields partial text chunks as they arrive from the provider.
   */
  stream(prompt: AIPrompt): AsyncIterable<GeneratedText>;
}

/**
 * Provider identifier used in runtimeConfig to select the active AI backend.
 * Extend this union as new providers are added.
 */
export const AIProviderName = {
  anthropic: "anthropic",
  gemini: "gemini",
  ollama: "ollama",
  openai: "openai",
} as const;
export type AIProviderName =
  (typeof AIProviderName)[keyof typeof AIProviderName];

/**
 * Shape of the AI-related runtime configuration.
 * Defaults are declared in `nuxt.config.ts` under `runtimeConfig.ai`;
 * actual values will be set via environment variables (CAM-16).
 */
export interface AIRuntimeConfig {
  provider: AIProviderName;
  apiKey?: string;
  model?: string;
  ollamaHost?: string;
}
