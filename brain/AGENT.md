# Campaign Dealer — Agent Brain

> **Level 1 routing file.** Always read this first. It tells you which module to load for the current task.

## Project identity

Campaign Dealer is a **Nuxt 4 full-stack app** for generating tabletop RPG campaigns using AI. The system is for "The House Doesn't Always Win" (a card-suit-based RPG). Game Boy pixel-art aesthetic.

## Layer boundaries

- **`app/`** — client only; never calls AI providers directly; reads from Pinia store
- **`server/`** — all sensitive operations; API keys never leave this layer
- **`shared/types/`** — TypeScript types shared by both sides; Nuxt 4 auto-imports from here

## Key data flow

```txt
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

## Module map

| Module           | Directory             | Load when the task involves...                                                  |
| ---------------- | --------------------- | ------------------------------------------------------------------------------- |
| **architecture** | `brain/architecture/` | Layer contracts, dependency rules, system structure, scaling paths              |
| **rpg**          | `brain/rpg/`          | Character generation, archetypes, suits, skills, game mechanics, randomizer     |
| **ai**           | `brain/ai/`           | AI providers, prompt engineering, model behavior, JSON parsing from completions |
| **frontend**     | `brain/frontend/`     | Vue components, Game Boy aesthetic, Tailwind v4, i18n, Pinia store, composables |
| **planning**     | `brain/planning/`     | Dev roadmap, phase status, component contracts, in-flight work                  |
| **tooling**      | `brain/tooling/`      | Testing, CI, deployment, dev environment, dependency management                 |

## Decision table

| User says / task looks like...                   | Action sequence                                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| "Add a new character skill / archetype / suit"   | 1. Read `brain/rpg/RPG.md` 2. Check `server/data/houseDoesntWin/` 3. Update types in `shared/types/`           |
| "Add a new AI provider"                          | 1. Read `brain/ai/AI.md` 2. Create `server/services/ai/<name>.ts` 3. Call `registerProvider()`                 |
| "Change a prompt / improve AI output"            | 1. Read `brain/ai/AI.md` 2. Edit `server/services/ai/prompts/` 3. Test with `--project server`                 |
| "Add / modify a UI component"                    | 1. Read `brain/frontend/FRONTEND.md` 2. Check design tokens in `app/assets/css/` 3. Use i18n keys              |
| "What's the overall architecture / layer rules?" | 1. Read `brain/architecture/ARCHITECTURE.md` 2. Identify relevant layer                                        |
| "What phase are we on / what's done?"            | 1. Read `brain/planning/phases.jsonl` 2. Check status fields                                                   |
| "What are the component contracts for X?"        | 1. Read `brain/planning/PLANNING.md` 2. Find component in contracts table                                      |
| "Fix a bug in character generation"              | 1. Read `brain/rpg/RPG.md` + `brain/ai/AI.md` 2. Check randomizer + prompt 3. Write regression test            |
| "Add i18n strings"                               | 1. Read `brain/frontend/FRONTEND.md` 2. Add to both `en.json` and `it.json` 3. Natural case, CSS for uppercase |
| "Write / fix a test"                             | 1. Read `brain/tooling/OPERATIONS.md` 2. Identify vitest project (unit/nuxt/server) 3. Run targeted            |
| "Add a new API endpoint"                         | 1. Read `brain/ai/AI.md` 2. Add Zod schema in `server/utils/validate.ts` 3. Follow existing patterns           |
| "Change the theme / palette"                     | 1. Read `brain/frontend/FRONTEND.md` 2. Use `@theme` (Tailwind v4) 3. Respect 4-shade palette system           |
| "Refactor / restructure code"                    | 1. Check `brain/tooling/decisions.jsonl` for past rationale 2. Preserve layer boundaries                       |

## Core rules

1. **Layer boundaries are sacred.** `app/` never calls AI directly. `server/` owns all API keys. `shared/types/` is the contract.
2. **Game data is copyright-protected.** `characterTemplates.ts` is git-ignored. Never commit rulebook text publicly.
3. **i18n from day one.** All user-facing text uses i18n keys. Natural case in locale files; CSS for visual transforms.
4. **Tailwind v4 uses `@theme`**, not `:root` for CSS variable overrides.
5. **Test before you ship.** Identify the right vitest project (`unit`, `nuxt`, or `server`) and run targeted tests.
6. **AI providers are pluggable.** Never import a provider SDK outside its own file. Use the `AIProvider` interface.
7. **Append-only for JSONL files in `brain/`.** Never overwrite — only append new entries. Mark outdated entries with `"status": "archived"`.
8. **IDs are timestamps.** Use `{type}_{YYYYMMDD}_{HHMMSS}` format for all new entries (e.g. `rpg_20260404_143000`).
