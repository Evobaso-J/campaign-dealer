# AI Integration Module

> **Level 2 module instructions.** Load this when the task involves AI providers, prompts, or model output handling.

## File inventory

| File                                      | Purpose                                                     |
| ----------------------------------------- | ----------------------------------------------------------- |
| `server/services/ai/index.ts`             | `AIProvider` interface, registry, `getAIProvider()` factory |
| `server/services/ai/types.ts`             | `AIProvider` interface definition                           |
| `server/services/ai/anthropic.ts`         | Anthropic implementation (imports `@anthropic-ai/sdk`)      |
| `server/services/ai/gemini.ts`            | Google Gemini implementation                                |
| `server/services/ai/openai.ts`            | OpenAI implementation                                       |
| `server/services/ai/ollama.ts`            | Ollama local implementation                                 |
| `server/services/ai/prompts/character.ts` | Character identity prompt builder                           |
| `server/services/ai/prompts/script.ts`    | GM script prompt builder                                    |
| `server/utils/parseAIJson.ts`             | JSON extraction from AI completions                         |
| `brain/ai/decisions.jsonl`                | Past AI-related decisions and their reasoning               |

## Provider pattern

Adding a new provider requires **only**:

1. Create `server/services/ai/<name>.ts` implementing `AIProvider`
2. Call `registerProvider("<name>", factory)` at module load

No other files change. The factory reads `runtimeConfig.ai.provider` to select the active provider.

## Provider isolation rules

- Each provider file imports only its own SDK
- Providers do **not** parse JSON — callers own parsing via `parseAIJson.ts`
- Providers return raw completion text; the calling code handles structured output

## Prompt architecture

Prompt builders are pure functions: `(inputs) → { system: string, user: string }`

- They live in `server/services/ai/prompts/` and are independent of the provider
- Character prompts receive `CharacterTemplate` + setting + language
- Script prompts receive `CharacterSheet[]` + setting + language

## Configuration

| Env var               | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `NUXT_AI_PROVIDER`    | `"anthropic"`, `"gemini"`, `"ollama"`, `"openai"` |
| `NUXT_AI_API_KEY`     | API key (required for commercial providers)       |
| `NUXT_AI_OLLAMA_HOST` | Ollama host URL                                   |
| `NUXT_AI_MODEL`       | Optional model override                           |

<instructions>
- Never import a provider SDK outside its own implementation file.
- Never let API keys leave the server layer.
- Prompts must accept a `language` parameter and instruct the AI to respond in that language.
- Always test prompt changes with `pnpm vitest run --project server`.
- When AI output parsing fails, check `parseAIJson.ts` — it handles markdown-wrapped JSON and common LLM output quirks.
- Log prompt/response shapes in `brain/ai/decisions.jsonl` when making significant prompt changes.
</instructions>
