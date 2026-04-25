# AI

<!-- exodia:section:intro -->
AI provider integration: the registry, provider isolation rules, prompt architecture, and JSON parsing. Read this when adding a provider, changing a prompt, or fixing AI output handling. All API keys stay in `server/`; the client never imports any provider SDK.

## File Inventory

<!-- exodia:section:files -->

| File                                      | Purpose                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `server/services/ai/index.ts`             | `AIProvider` interface, registry, `getAIProvider()` factory             |
| `server/services/ai/types.ts`             | `AIProvider` interface definition                                       |
| `server/services/ai/anthropic.ts`         | Anthropic implementation (`@anthropic-ai/sdk`)                          |
| `server/services/ai/gemini.ts`            | Google Gemini implementation                                            |
| `server/services/ai/openai.ts`            | OpenAI implementation                                                   |
| `server/services/ai/ollama.ts`            | Ollama local implementation                                             |
| `server/services/ai/prompts/character.ts` | Character identity prompt builder                                       |
| `server/services/ai/prompts/script.ts`    | GM script prompt builder                                                |
| `server/utils/parseAIJson.ts`             | JSON extraction from completions (markdown wrappers, common LLM quirks) |

## Provider Pattern

<!-- exodia:section:providers -->
Adding a provider requires only two steps:

1. Create `server/services/ai/<name>.ts` implementing `AIProvider`.
2. Call `registerProvider("<name>", factory)` at module load.

`getAIProvider()` reads `runtimeConfig.ai.provider` and selects from the registry. **No other files change.**

## Provider Isolation Rules

<!-- exodia:section:isolation -->
- Each provider file imports only its own SDK.
- Providers do **not** parse JSON; they return raw completion text.
- Callers own structured-output parsing via `parseAIJson.ts`.
- Never import a provider SDK outside its own implementation file (single-source-of-truth for SDK upgrades).

## Prompt Architecture

<!-- exodia:section:prompts -->
Prompt builders are **pure functions**: `(inputs) → { system: string, user: string }`.

- They live in `server/services/ai/prompts/` and are provider-independent.
- Character prompts receive `CharacterTemplate` + setting + language.
- Script prompts receive `CharacterSheet[]` + setting + language.
- Every prompt accepts a `language` parameter and instructs the model to answer in that language.

## Configuration

<!-- exodia:section:config -->
All config goes through Nuxt `runtimeConfig.ai.*`; env vars use the `NUXT_AI_*` prefix. The full mapping (env var → runtime config path → purpose) lives in `.env.example` — do not duplicate it here.

## Operating Rules

<!-- exodia:section:rules -->
- Test prompt changes with `pnpm vitest run --project server`.
- When AI parsing fails, start in `parseAIJson.ts` — it normalizes markdown-wrapped JSON and common LLM quirks.
- Log significant prompt/response shape changes in `decisions.jsonl`.

## L3 Data

<!-- exodia:section:l3 -->
- `decisions.jsonl`: AI integration decisions (registry pattern, parsing strategy, provider additions).
