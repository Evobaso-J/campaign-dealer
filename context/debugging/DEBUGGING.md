# Debugging

<!-- exodia:section:intro -->
Diagnose breakage in the wizard, AI calls, or build. Start here when something fails to generate or render.

## Local Environment Setup

<!-- exodia:section:env-setup -->
Node + pnpm; versions pinned via `package.json` (`packageManager` and `engines`). Copy `.env.example` to `.env` and provide `NUXT_AI_PROVIDER` plus the matching credentials. Run `pnpm dev`.

## How to use this module

<!-- exodia:section:how-to-use -->
1. Reproduce the symptom.
2. Search `playbooks.jsonl` for matching symptoms.
3. If found → follow the playbook fix.
4. If not found → after solving, append a new playbook entry per the Self-Update Rules.
5. For recurring footguns (not tied to one bug), append to `gotchas.jsonl` instead.

## Common Topics

<!-- exodia:section:topics -->

- **AI output parsing.** First stop: `server/utils/parseAIJson.ts`. Provider files never parse — they return raw text. The parser handles markdown-wrapped JSON and common LLM quirks.
- **Layer leaks.** If `app/` accidentally imports from `server/`, the build breaks or types vanish — check the import path. `shared/types/` is the only legal cross-layer surface.
- **Tailwind v4 theming.** CSS variable overrides must live inside `@theme` (or `@layer theme { .light { } }` for Nuxt UI variables), never `:root`; Tailwind v4 ignores `:root`-level overrides.
- **i18n drift.** Adding a key to `en.json` without `it.json` (or vice versa) triggers fallback. Always update both files in the same change.
- **Vitest project mismatch.** Component tests under `app/**/*.nuxt.test.ts` need `--project nuxt`. Pure-logic tests use `unit`. Server tests use `server`. Wrong project → wrong environment → cryptic failures.
- **Game data missing locally.** `server/data/houseDoesntWin/characterTemplates.ts` is git-ignored. New clones see only the `*.example.ts` shape — copy and populate from the rulebook before running.

## L3 Data

<!-- exodia:section:l3 -->
- `gotchas.jsonl`: known footguns and how to avoid them.
- `playbooks.jsonl`: symptom → root cause → fix recipes.
