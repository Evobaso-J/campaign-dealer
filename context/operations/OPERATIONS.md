# Operations

<!-- exodia:section:intro -->
Local dev, env vars, test infrastructure, CI hooks. Read this when configuring the dev environment, adding env variables, or wiring CI.

## Environments

<!-- exodia:section:environments -->
Single deploy target (no staging/QA matrix yet). Local dev: copy `.env.example` to `.env` and run `pnpm dev`. The full env-var inventory lives in `.env.example` — do not duplicate it here.

`runtimeConfig` exposure: env vars prefixed `NUXT_*` are mapped onto `runtimeConfig` paths in `nuxt.config.ts`. The AI subset (`NUXT_AI_*`) maps to `runtimeConfig.ai.*`.

## Variants

<!-- exodia:section:variants -->
None at present. Single-tenant, single-deploy app. If a variant axis is introduced (e.g. self-hosted vs hosted, or shipping multiple RPG systems together), capture differences in `variants.yaml`.

## Configuration System

<!-- exodia:section:config -->
- `nuxt.config.ts` — Nuxt runtime config and module wiring.
- `.env.example` — env-var inventory (canonical list).
- `vitest.config.ts` — three test projects: `unit`, `nuxt`, `server`.
- `vitest.smoke.config.ts` — smoke / integration config.
- `eslint.config.mjs` — lint rules.
- `.husky/` — git hooks.
- `.github/` — GitHub Actions workflows.

## Test Structure

<!-- exodia:section:tests -->

| Vitest project | Pattern                                   | Environment | Use for                               |
| -------------- | ----------------------------------------- | ----------- | ------------------------------------- |
| `unit`         | `app/**/*.test.ts`, `shared/**/*.test.ts` | node        | Pure logic, utilities, non-Nuxt code  |
| `nuxt`         | `app/**/*.nuxt.test.ts`                   | nuxt        | Components, composables needing Nuxt  |
| `server`       | `server/**/*.test.ts`                     | node        | API endpoints, services, AI providers |

Path aliases in tests: `~~` = project root, `~` = `app/`. Server tests support aliases; unit tests use relative paths.

## Commands

<!-- exodia:section:commands -->
All package scripts live in `package.json`; do not duplicate the inventory here. Common targeted invocations:

```bash
# Single test file
pnpm vitest run --project unit shared/utils/characterRandomizer.test.ts
pnpm vitest run --project server server/services/ai/index.test.ts

# All tests for one project
pnpm vitest run --project server

# Smoke (against running server)
pnpm vitest run --config vitest.smoke.config.ts

# Smoke against local Ollama
pnpm smoke:ollama
```

Use `pnpm` exclusively (locked via `packageManager` in `package.json`).

## Deploy

<!-- exodia:section:deploy -->
No deploy target wired into the repo (no Vercel / Netlify / Docker config present). When a target is chosen, capture the decision in `architecture/decisions.jsonl` and the per-environment knobs in `variants.yaml`.

## Localization / i18n

<!-- exodia:section:i18n -->
`@nuxtjs/i18n` with `en` (default) and `it`. Locale files at `i18n/locales/{en,it}.json`. Update both files for every user-facing string. Conventions live in `frontend/FRONTEND.md` § i18n.

## Operating Rules

<!-- exodia:section:rules -->
- Always use `pnpm`, never `npm`.
- Never `--no-verify`; fix the underlying hook failure.
- When a test fails, fix the root cause; do not skip the test.
- Identify the right vitest project before running tests.

## L3 Data

<!-- exodia:section:l3 -->
- `decisions.jsonl`: tooling / ops decisions (test-project split, validation library choice).
- `variants.yaml`: per-variant overrides (currently empty; populate when a variant axis appears).
