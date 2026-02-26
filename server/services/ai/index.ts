import type { GeneratedText } from "~~/shared/types/utils";
import {
  AIProviderError,
  ok,
  err,
  type Result,
} from "~~/server/utils/errors";
import { AnthropicProvider } from "./anthropic";
import { OllamaProvider } from "./ollama";
import { OpenAIProvider } from "./openai";

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

/** Registry of provider factory functions, keyed by provider name. */
const providerRegistry = new Map<
  AIProviderName,
  (config: AIRuntimeConfig) => AIProvider
>();

/**
 * Register a provider factory.
 */
export function registerProvider(
  name: AIProviderName,
  factory: (config: AIRuntimeConfig) => AIProvider,
): void {
  providerRegistry.set(name, factory);
}

function validateAiConfig(config: {
  provider?: string;
  apiKey?: string;
  model?: string;
  ollamaHost?: string;
}): Result<AIRuntimeConfig, AIProviderError> {
  if (!config.provider) {
    return err(
      new AIProviderError(
        "AI provider is not configured. Set runtimeConfig.ai.provider in nuxt.config.ts.",
      ),
    );
  }
  const aiProviders = Object.values(AIProviderName);
  if (!aiProviders.includes(config.provider as AIProviderName)) {
    const valid = aiProviders.join(", ");
    return err(
      new AIProviderError(
        `Invalid AI provider "${config.provider}". Valid options are: ${valid}. ` +
          "Set runtimeConfig.ai.provider in nuxt.config.ts.",
      ),
    );
  }

  if (config.provider === AIProviderName.ollama && !config.ollamaHost) {
    return err(
      new AIProviderError(
        'AI provider "ollama" is configured but no host was provided. ' +
          "Set runtimeConfig.ai.ollamaHost via NUXT_AI_OLLAMA_HOST environment variable.",
      ),
    );
  }

  if (!config.apiKey && config.provider !== AIProviderName.ollama) {
    return err(
      new AIProviderError(
        `AI provider "${config.provider}" is configured but no API key was provided. ` +
          "Set runtimeConfig.ai.apiKey via NUXT_AI_API_KEY environment variable.",
      ),
    );
  }

  return ok(config as AIRuntimeConfig);
}

/**
 * Returns the configured AIProvider instance.
 *
 * Reads `runtimeConfig.ai` to determine which provider to instantiate.
 * Returns an error Result if the provider is not configured or not registered.
 */
export function getAIProvider(): Result<AIProvider, AIProviderError> {
  const config = useRuntimeConfig();

  const validated = validateAiConfig(config.ai);
  if (!validated.ok) return validated;

  const factory = providerRegistry.get(validated.value.provider);
  if (!factory) {
    const available = [...providerRegistry.keys()].join(", ") || "(none)";
    return err(
      new AIProviderError(
        `AI provider "${validated.value.provider}" is not registered. ` +
          `Available providers: ${available}. ` +
          `Ensure the provider module is imported.`,
      ),
    );
  }

  return ok(factory(validated.value));
}

/** Explicit provider registration — ensures factories are available at runtime. */
registerProvider("anthropic", (config) => new AnthropicProvider(config));
registerProvider("ollama", (config) => new OllamaProvider(config));
registerProvider("openai", (config) => new OpenAIProvider(config));
