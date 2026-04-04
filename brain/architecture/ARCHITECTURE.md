# Architecture Module

> **Level 2 module instructions.** Load this when the task involves system structure, layer boundaries, or scaling the application.

## Layer boundaries

| Layer     | Directory      | Responsibility                        | Forbidden                                 |
| --------- | -------------- | ------------------------------------- | ----------------------------------------- |
| Client    | `app/`         | UI, composables, Pinia store          | Direct AI calls; importing from `server/` |
| Server    | `server/`      | API routes, AI calls, RPG logic       | Importing from `app/`; exposing API keys  |
| Shared    | `shared/`      | TypeScript types only                 | Business logic; side effects              |
| Game data | `server/data/` | RPG system constants (server-private) | Sending raw data to client                |

## Dependency direction

```
app/  →  shared/types/   (auto-imported by Nuxt 4)
server/  →  shared/types/  (auto-imported by Nuxt 4)
app/  ✗→  server/          (never)
```

## Key data flow

```
User fills wizard
  → useCampaign.ts composable
      → POST /api/campaign/characters
          → Zod validation
          → randomizer.generateRandomDistinctCharacters() × N
          → aiProvider.complete(characterPrompt(template, setting)) × N
          → merge template + AI identity → CharacterSheet[]
      → POST /api/campaign/script
          → Zod validation
          → aiProvider.complete(scriptPrompt(characters, setting))
          → GmScript
  → Results written to Pinia store; components render reactively
```

## Scaling conventions

| Addition         | How to do it                                                                    | Files that change              |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| New RPG system   | Add `server/data/<system-name>/` + config flag in randomizer                    | Randomizer config only         |
| New AI provider  | Implement `AIProvider` in `server/services/ai/<name>.ts` + `registerProvider()` | 1 new file only                |
| Streaming output | `AIProvider.stream()` → SSE endpoint                                            | New endpoint + provider method |
| Save campaigns   | Drizzle + DB; store shape maps to schema                                        | `server/` layer only           |
| PDF export       | `server/utils/pdf.ts` + `/api/campaign/export`                                  | New endpoint + utility         |
| New language     | Add locale file under `i18n/locales/`                                           | Locale file only               |

## File inventory

| File                                 | Purpose                                                          |
| ------------------------------------ | ---------------------------------------------------------------- |
| `nuxt.config.ts`                     | Runtime config, i18n, module registration                        |
| `shared/types/character.ts`          | Core types: `CharacterSheet`, `CharacterTemplate`, branded types |
| `shared/types/campaign.ts`           | `GmScript`, `GenerationRequest`, `GenerationResponse`            |
| `server/utils/validate.ts`           | Zod schemas for all API inputs                                   |
| `brain/architecture/decisions.jsonl` | Past cross-cutting architectural decisions                       |

<instructions>
- Never import from `server/` in `app/`. Enforce this at code review.
- Never expose API keys outside `server/`. All AI calls go through server API routes.
- New features follow existing scaling paths — do not restructure layers for new functionality.
- If a type is used by both client and server, it belongs in `shared/types/`.
- Log cross-cutting architectural decisions in `brain/architecture/decisions.jsonl`.
</instructions>
