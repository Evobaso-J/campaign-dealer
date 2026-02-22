import type { GeneratedText } from "~~/shared/types/utils";

/**
 * The shape returned by prompt builders in `server/services/ai/prompts/`.
 * Each prompt builder takes typed domain inputs and returns system + user
 * strings that are provider-agnostic.
 */
export interface AIPrompt {
  system: string;
  user: string;
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
export type AIProviderName = "anthropic";

/**
 * Shape of the AI-related runtime configuration.
 * Documents what `nuxt.config.ts` should declare under `runtimeConfig.ai`
 * (to be set up in CAM-16).
 */
export interface AIRuntimeConfig {
  provider: AIProviderName;
  apiKey: string;
  model?: string;
}

/** Registry of provider factory functions, keyed by provider name. */
const providerRegistry = new Map<
  AIProviderName,
  (config: AIRuntimeConfig) => AIProvider
>();

/**
 * Register a provider factory. Called by each provider module at import time.
 *
 * @example
 * // In server/services/ai/anthropic.ts (CAM-11):
 * import { registerProvider } from "./index";
 * registerProvider("anthropic", (config) => new AnthropicProvider(config));
 */
export function registerProvider(
  name: AIProviderName,
  factory: (config: AIRuntimeConfig) => AIProvider,
): void {
  providerRegistry.set(name, factory);
}

/**
 * Returns the configured AIProvider instance.
 *
 * Reads `runtimeConfig.ai` to determine which provider to instantiate.
 * Throws if the provider is not configured or not registered.
 */
export function getAIProvider(): AIProvider {
  const config = useRuntimeConfig();
  const aiConfig = (config as Record<string, unknown>).ai as
    | AIRuntimeConfig
    | undefined;

  if (!aiConfig?.provider) {
    throw new Error(
      "AI provider is not configured. Set runtimeConfig.ai.provider in nuxt.config.ts.",
    );
  }

  if (!aiConfig.apiKey) {
    throw new Error(
      `AI provider "${aiConfig.provider}" is configured but no API key was provided. ` +
        "Set runtimeConfig.ai.apiKey via NUXT_AI_API_KEY environment variable.",
    );
  }

  const factory = providerRegistry.get(aiConfig.provider);
  if (!factory) {
    const available = [...providerRegistry.keys()].join(", ") || "(none)";
    throw new Error(
      `AI provider "${aiConfig.provider}" is not registered. ` +
        `Available providers: ${available}. ` +
        `Ensure the provider module is imported.`,
    );
  }

  return factory(aiConfig);
}
