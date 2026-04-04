# Tooling Module

> **Level 2 module instructions.** Load this when the task involves testing, CI, dev environment, or tooling.

## Commands

```bash
# Run a single test file
pnpm vitest run --project unit shared/utils/characterRandomizer.test.ts
pnpm vitest run --project server server/services/ai/index.test.ts

# Dev server
pnpm dev
```

## Environment variables

Copy `.env.example` to `.env`. The key variables (mapped via Nuxt `runtimeConfig`):

| Env var               | `runtimeConfig` path | Purpose                                              |
| --------------------- | -------------------- | ---------------------------------------------------- |
| `NUXT_AI_PROVIDER`    | `ai.provider`        | `"anthropic"`, `"gemini"`, `"ollama"`, or `"openai"` |
| `NUXT_AI_API_KEY`     | `ai.apiKey`          | API key (required for Anthropic, Gemini, OpenAI)     |
| `NUXT_AI_OLLAMA_HOST` | `ai.ollamaHost`      | Ollama host URL (required for Ollama)                |
| `NUXT_AI_MODEL`       | `ai.model`           | Optional; defaults per provider (see `.env.example`) |

## File inventory

| File                            | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `vitest.config.ts`              | Three test projects: unit, nuxt, server |
| `vitest.smoke.config.ts`        | Smoke/integration test config           |
| `eslint.config.mjs`             | ESLint configuration                    |
| `.husky/`                       | Git hooks                               |
| `.github/`                      | GitHub Actions workflows                |
| `brain/tooling/decisions.jsonl` | Past tooling decisions                  |
| `brain/tooling/failures.jsonl`  | Past failures and their fixes           |

## Test structure

| Vitest project | Pattern                                   | Environment | Use for                               |
| -------------- | ----------------------------------------- | ----------- | ------------------------------------- |
| `unit`         | `app/**/*.test.ts`, `shared/**/*.test.ts` | node        | Pure logic, utilities, non-Nuxt code  |
| `nuxt`         | `app/**/*.nuxt.test.ts`                   | nuxt        | Components, composables needing Nuxt  |
| `server`       | `server/**/*.test.ts`                     | node        | API endpoints, services, AI providers |

## Running tests

```bash
# Single file
pnpm vitest run --project unit path/to/file.test.ts
pnpm vitest run --project server server/services/ai/index.test.ts

# All tests for a project
pnpm vitest run --project server

# Smoke tests (requires running server)
pnpm vitest run --config vitest.smoke.config.ts
```

## Path aliases in tests

- `~~` = project root
- `~` = `app/`

<instructions>
- Always identify the correct vitest project before running tests.
- Never skip pre-commit hooks (`--no-verify`). Fix the underlying issue.
- When a test fails, investigate the root cause rather than disabling the test.
- Log significant failures and their fixes in `brain/tooling/failures.jsonl`.
- Keep tests focused: one assertion per concept, descriptive test names.
- Server tests can use path aliases (`~~`, `~`). Unit tests use relative paths.
</instructions>
