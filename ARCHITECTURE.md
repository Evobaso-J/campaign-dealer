# Architecture

## Overview

Campaign Dealer is a Nuxt 4 full-stack application. The architecture is designed around three principles:

- **Security**: AI provider keys never leave the server
- **Extensibility**: new RPG systems, AI providers, and features can be added without touching existing code
- **Simplicity**: each layer has a single responsibility and clear boundaries

---

## Directory structure

```md
campaign-dealer/
├── app/                              # Nuxt 4 client-side app
│   ├── pages/
│   │   ├── index.vue                 # Landing page
│   │   └── campaign/
│   │       └── new.vue               # Campaign creation wizard
│   ├── components/
│   │   ├── campaign/
│   │   │   ├── WizardStepper.vue     # Multi-step generation flow
│   │   │   ├── PlayerCountInput.vue  # 1–6 player stepper
│   │   │   └── SettingForm.vue       # Setting description + tone selector
│   │   ├── character/
│   │   │   ├── CharacterSheet.vue    # Single character card
│   │   │   └── CharacterGrid.vue     # Responsive grid of sheets
│   │   └── script/
│   │       └── GmScript.vue          # GM session-zero script output
│   ├── composables/
│   │   └── useCampaign.ts            # Orchestrates the generation flow
│   └── stores/
│       └── campaign.ts               # Pinia: campaign state across wizard steps
│
├── server/                           # Nuxt server (runs server-side only)
│   ├── api/
│   │   └── campaign/
│   │       ├── characters.post.ts    # POST /api/campaign/characters
│   │       └── script.post.ts        # POST /api/campaign/script
│   ├── services/
│   │   ├── ai/
│   │   │   ├── index.ts              # AIProvider interface + factory
│   │   │   ├── anthropic.ts          # Anthropic implementation
│   │   │   └── prompts/
│   │   │       ├── character.ts      # Prompt builder for character enrichment
│   │   │       └── script.ts         # Prompt builder for GM script
│   │   └── rpg/
│   │       └── randomizer.ts         # Dice rolls and random table lookups
│   ├── utils/
│   │   └── validate.ts               # Zod schemas for API input validation
│   └── data/
│       └── house-doesnt-win/         # Game system data (server-private, never sent raw to client)
│           ├── character-templates.ts    # Archetype skill pools and modifier skills
│           └── random-tables.ts          # Names, concepts, weapons, instruments
│
└── shared/
    └── types/                        # Types used by both client and server
        ├── campaign.ts
        └── character.ts
```

---

## Layers

### Client (`app/`)

The client is responsible for UI only. It never calls the AI provider directly.

- **Pages** compose components and trigger generation via the `useCampaign` composable
- **Components** are organised by domain (`campaign/`, `character/`, `script/`) and are purely presentational
- **Composables** handle the async orchestration: call server APIs, write to the Pinia store, expose loading/error state
- **Stores** (Pinia) persist campaign state across wizard steps so the user's inputs survive navigation

### Server (`server/`)

The server owns all sensitive operations.

- **API routes** (`server/api/`) are the only entry points from the client. They validate input with Zod, call services, and return typed responses.
- **AI service** (`server/services/ai/`) is abstracted behind an `AIProvider` interface. The factory function reads `runtimeConfig` to select the active provider. Adding a new provider (e.g. OpenAI, Ollama) means creating a new file that implements the interface — no other code changes.
- **RPG randomizer** (`server/services/rpg/`) is pure logic with no AI dependency. It reads the data JSON files and produces randomized character skeletons. This separation means character randomization is instant and deterministic; AI only handles the narrative enrichment on top.
- **Prompts** (`server/services/ai/prompts/`) are isolated from the provider implementations. Each prompt builder takes typed inputs and returns `{ system, user }` strings, making them easy to iterate on independently.

### Shared (`shared/`)

TypeScript types that are imported by both `app/` and `server/`. Nuxt 4 auto-imports from this directory on both sides, ensuring the client and server always agree on the shape of data crossing the API boundary.

### Server data (`server/data/`)

Static JSON files that define the game system data. They live inside `server/` because they are server-private — the client never receives them raw, only the processed `CharacterSheet` objects that the randomizer produces from them.

- Data is typed with `satisfies` — shape errors are caught at compile time, not at runtime
- Adding a new RPG system means adding a new subdirectory and a config flag in the randomizer
- Migrating to a database means replacing the `const` imports with DB queries inside `server/services/rpg/` — no other layer changes

---

## Data flow

```md
User fills wizard
      │
      ▼
useCampaign.ts
      │
      ├─► POST /api/campaign/characters
      │         │
      │         ├─ validate input (Zod)
      │         ├─ randomizer.generateCharacter() × N   ← reads server/data JSON
      │         └─ aiProvider.complete(characterPrompt)  × N
      │                   └─► returns CharacterSheet[]
      │
      └─► POST /api/campaign/script
                │
                ├─ validate input (Zod)
                └─ aiProvider.complete(scriptPrompt)
                          └─► returns GmScript
```

Both API calls write their results into the Pinia store. Components reactively display the results as they arrive.

---

## Key decisions

| Concern | Decision | Reason |
| --- | --- | --- |
| AI calls location | Server-only | API keys never exposed to the client |
| AI provider coupling | Interface + factory | Swap providers without touching feature code |
| Character randomization | Pre-AI, pure logic | Fast, deterministic, testable without API calls |
| Shared types | `shared/types/` | Single source of truth for client–server contract |
| Game data | JSON in `server/data/` | Server-private; raw tables never sent to client |
| State management | Pinia | Persists wizard state; straightforward to add persistence/server sync later |

---

## Scaling paths

The current architecture supports the following additions without restructuring:

- **New RPG system**: add `server/data/<system-name>/` + a config flag to select it in the randomizer
- **New AI provider**: implement `AIProvider` interface in `server/services/ai/<provider>.ts`
- **Streaming output**: `AIProvider` already defines a `stream()` method; wire it to an SSE endpoint
- **Save campaigns**: add a database (Drizzle + SQLite/Postgres) and an auth layer; the store shape maps directly to a DB schema
- **PDF export**: add a `server/utils/pdf.ts` utility called from a new `/api/campaign/export` route
- **Multiple languages**: `@nuxtjs/i18n` is already installed; add locale files under `locales/`
