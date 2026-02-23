# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run a single test file by specifying its Vitest project (`unit`, `nuxt`, or `server`):

```bash
pnpm vitest run --project unit server/services/rpg/characterRandomizer.test.ts
pnpm vitest run --project server server/services/ai/index.test.ts
```

## Environment variables

Copy `.env.example` to `.env`. The key variables (mapped via Nuxt `runtimeConfig`):

| Env var | `runtimeConfig` path | Purpose |
| --- | --- | --- |
| `NUXT_AI_PROVIDER` | `ai.provider` | `"anthropic"` or `"ollama"` |
| `NUXT_AI_API_KEY` | `ai.apiKey` | Anthropic API key (required for Anthropic) |
| `NUXT_AI_OLLAMA_HOST` | `ai.ollamaHost` | Ollama host URL (required for Ollama) |
| `NUXT_AI_MODEL` | `ai.model` | Optional; defaults to `claude-sonnet-4-20250514` / `llama3.1` |

## Architecture

Campaign Dealer is a **Nuxt 4 full-stack app** for generating tabletop RPG campaigns using AI. The system is for "The House Doesn't Always Win" (a card-suit-based RPG).

### Layer boundaries

- **`app/`** — client only; never calls AI providers directly; reads from Pinia store
- **`server/`** — all sensitive operations; API keys never leave this layer
- **`shared/types/`** — TypeScript types shared by both sides; Nuxt 4 auto-imports from here

### Key data flow

```
User fills wizard
  → useCampaign.ts composable
      → POST /api/campaign/characters
          → Zod validation
          → generateRandomDistinctCharacters() × N  [server/services/rpg/characterRandomizer.ts]
          → getAIProvider().complete(buildCharacterPrompt(skeleton, setting)) × N
          → merge skeleton + AI identity → CharacterSheet[]
      → POST /api/campaign/script
          → Zod validation
          → getAIProvider().complete(buildScriptPrompt(characters, setting))
          → GmScript
  → Results written to Pinia store; components render reactively
```

### AI provider pattern

`server/services/ai/index.ts` defines the `AIProvider` interface and a registry-based factory (`getAIProvider()`). **Adding a new provider** (OpenAI, Ollama, etc.) requires only:

1. Create `server/services/ai/<name>.ts` implementing `AIProvider`
2. Call `registerProvider("<name>", factory)` at module load — no other files change

The Anthropic implementation (`anthropic.ts`) is the only file that imports `@anthropic-ai/sdk`. Providers do **not** parse JSON; callers own that.

### Character generation split

The randomizer (`server/services/rpg/characterRandomizer.ts`) produces a `CharacterTemplate` — a `CharacterSheet` **without** `characterIdentity`, **plus** `suitCharacterization` and `archetypeCharacterization` strings from the game data. The AI then receives those characterizations and generates `name`, `pronouns`, `concept`, `weapon`, and `instrument` contextually for the campaign setting.

### Branded types (`shared/types/utils.ts`)

- `GeneratedText` — marks strings produced by AI (never from fixed tables)
- `I18nKey` — marks strings that are i18n keys resolved on the frontend (skill names/descriptions)

`CharacterSkill.name` and `.description` are `I18nKey`; `CharacterIdentity` fields are `GeneratedText`.

### Game data (`server/data/houseDoesntWin/`)

`characterTemplates.ts` contains text derived from a commercial rulebook and is **git-ignored on public repos**. A `characterTemplates.example.ts` with placeholder values documents the expected shape for new contributors. The actual file must never be committed publicly.

### Test structure

Three Vitest projects configured in `vitest.config.ts`:

- `unit` — `test/unit/**`, node environment, pure logic
- `nuxt` — `test/nuxt/**`, Nuxt environment with `@nuxt/test-utils`
- `server` — `server/**/*.test.ts`, node environment with path aliases (`~~` = root, `~` = `app/`)

### i18n

`@nuxtjs/i18n` is configured with `en` (default) and `it` locales. Skill text must use i18n keys rather than hardcoded strings. Locale files containing skill text from the rulebook follow the same copyright restriction as `characterTemplates.ts`.
