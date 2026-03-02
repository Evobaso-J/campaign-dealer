import { AIProviderError, ok, err, type Result } from "~~/shared/types/errors";
import { AnthropicProvider } from "./anthropic";
import { OllamaProvider } from "./ollama";
import { OpenAIProvider } from "./openai";
import { AIProviderName } from "./types";
import type { AIProvider, AIRuntimeConfig } from "./types";

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
