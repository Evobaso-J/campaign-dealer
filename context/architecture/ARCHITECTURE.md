# Architecture

<!-- exodia:section:intro -->
Nuxt 4 full-stack app for AI-driven tabletop RPG campaign generation. The codebase is split into three layers (`app/` client, `server/` server, `shared/` types) plus a server-private game-data layer (`server/data/`). Layer import direction is one-way and enforced socially.

## Entry Points & Routing

<!-- exodia:section:routing -->
File-based pages routing via Nuxt 4. UI orchestration is wizard-driven: `app/components/WizardStepper.vue` owns navigation across four steps (`CharacterSelector` → `SettingForm` → `CharacterGrid` → `GmScript`). Server endpoints under `server/api/campaign/` follow the Nuxt H3 convention.

### Key Files

- `nuxt.config.ts` — runtime config, i18n, module registration
- `app/components/WizardStepper.vue` — client-side step orchestration
- `server/api/campaign/` — `characters.post.ts`, `script.post.ts` (and `characters/reroll.post.ts` once implemented)

## Modules & Boundaries

<!-- exodia:section:modules -->

| Layer     | Directory      | Responsibility                        | Forbidden                                 |
| --------- | -------------- | ------------------------------------- | ----------------------------------------- |
| Client    | `app/`         | UI, composables, Pinia store          | Direct AI calls; importing from `server/` |
| Server    | `server/`      | API routes, AI calls, RPG logic       | Importing from `app/`; exposing API keys  |
| Shared    | `shared/`      | TypeScript types only                 | Business logic; side effects              |
| Game data | `server/data/` | RPG system constants (server-private) | Sending raw data to client                |

Dependency direction:

```
app/     →  shared/types/   (auto-imported by Nuxt 4)
server/  →  shared/types/   (auto-imported by Nuxt 4)
app/     ✗→ server/         (never)
```

## State Management

<!-- exodia:section:state -->
Client state lives in Pinia (`app/stores/campaign.ts`). The store survives wizard step transitions; composables (`app/composables/useCampaign.ts`) own async orchestration: call server API, write to store, expose loading/error. Components are presentational: read store, emit events.

## Build

<!-- exodia:section:build -->
Nuxt 4 build (`nuxt build`, `nuxt generate`). Package manager is pnpm (locked via `packageManager` in `package.json`). No additional bundler config — Nuxt's defaults.

## Runtime Model

<!-- exodia:section:runtime -->
Hybrid: pages are prerenderable; API routes are server-only. The data flow:

```txt
User fills wizard
  → useCampaign.ts composable
      → POST /api/campaign/characters → Zod validate → AI provider × N → CharacterSheet[]
      → POST /api/campaign/script    → Zod validate → AI provider     → GameMasterScript
  → Pinia store → reactive components
```

All AI provider SDK access is server-side only. The client never sees an API key.

## Scaling Conventions

<!-- exodia:section:scaling -->

| Addition         | How                                                                              | Files that change              |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| New RPG system   | Add `server/data/<system-name>/` + config flag in randomizer                     | Randomizer config only         |
| New AI provider  | Implement `AIProvider` in `server/services/ai/<name>.ts` + `registerProvider()`  | 1 new file only                |
| Streaming output | `AIProvider.stream()` → SSE endpoint                                             | New endpoint + provider method |
| Save campaigns   | Drizzle + DB; store shape maps to schema                                         | `server/` layer only           |
| PDF export       | `server/utils/pdf.ts` + `/api/campaign/export`                                   | New endpoint + utility         |
| New language     | Add locale file under `i18n/locales/`                                            | Locale file only               |

## L3 Data

<!-- exodia:section:l3 -->
- `decisions.jsonl`: cross-cutting architectural decisions (layer split, type-sharing strategy, game-data isolation).
