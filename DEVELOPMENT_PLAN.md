# Development Plan

Implementation order follows the dependency chain: each phase unlocks the next.
Linear issue numbers are in parentheses.

---

## Phase 1 — Foundation

Everything else imports from here. No code is wasted if these are right.

- (CAM-5) Define shared TypeScript types (`shared/types/campaign.ts`, `shared/types/character.ts`)
- (CAM-16) Add runtime config in `nuxt.config.ts` + create `.env.example`

**Exit criteria**: `CharacterSheet`, `GmScript`, `GenerationRequest`, `GenerationResponse` types are stable and the dev server starts with env vars loaded.

---

## Phase 2 — RPG Data & Randomizer

Fully offline, no AI, no API key required. Lets you validate data shapes against the types before any network call.

- (CAM-7) Create `content/house-doesnt-win/random-tables.json`
- (CAM-8) Create `content/house-doesnt-win/character-templates.json`
- (CAM-9) Implement `server/services/rpg/randomizer.ts`

**Exit criteria**: calling `randomizer.generateCharacter()` returns a valid `CharacterSheet` that satisfies the shared types.

---

## Phase 3 — AI Service Layer

Build on top of the validated data shapes. The interface is defined first so prompts and the Anthropic implementation can be developed in parallel.

- (CAM-10) Define `AIProvider` interface + `getAIProvider()` factory
- (CAM-11) Implement Anthropic provider
- (CAM-12) Write character generation prompt builder
- (CAM-13) Write GM script prompt builder

**Exit criteria**: calling `getAIProvider().complete(characterPrompt)` against a randomizer-generated skeleton returns a JSON-parseable enriched `CharacterSheet`.

---

## Phase 4 — API Endpoints

Thin layer that wires validation → randomizer → AI and returns typed responses.

- (CAM-26) Add Zod validation schemas (`server/utils/validate.ts`)
- (CAM-14) `POST /api/campaign/characters`
- (CAM-15) `POST /api/campaign/script`
- (CAM-27) Add structured error handling to both endpoints

**Exit criteria**: both endpoints can be exercised with `curl` or a REST client and return correct typed payloads.

---

## Phase 5 — Client State & Orchestration

No UI yet — just the data plumbing on the client side.

- (CAM-6) Set up Pinia campaign store
- (CAM-23) Write `useCampaign` composable

**Exit criteria**: calling `useCampaign().generateCampaign(3, "1920s Chicago speakeasy")` from a test page populates the store with characters and a GM script.

---

## Phase 6 — UI Components

Build each component against the store data. Can be developed mostly in parallel once the store is populated.

- (CAM-17) `PlayerCountInput.vue`
- (CAM-18) `SettingForm.vue`
- (CAM-19) `WizardStepper.vue` — composes the two inputs above
- (CAM-20) `CharacterSheet.vue`
- (CAM-21) `CharacterGrid.vue` — composes `CharacterSheet`
- (CAM-22) `GmScript.vue`

**Exit criteria**: seeding the store manually and visiting the output page renders all character sheets and the GM script correctly.

---

## Phase 7 — Pages

Wire everything together end-to-end.

- (CAM-25) Landing page (`app/pages/index.vue`)
- (CAM-24) Campaign creation page (`app/pages/campaign/new.vue`)

**Exit criteria**: a user can open the app, fill in the wizard, and receive a complete set of character sheets + GM script without touching the browser console.

---

## Phase 8 — Polish

- (CAM-28) Add English i18n strings and wire `useI18n()` through all components
- (CAM-29) Finalize `.env.example` and update README setup instructions

---

## Dependency graph

```md
CAM-5 (types)
  │
  ├── CAM-16 (config)
  │
  ├── CAM-7 (random tables)
  │     └── CAM-9 (randomizer)
  │           └── CAM-14 (characters endpoint)
  │
  ├── CAM-8 (character templates)
  │     └── CAM-9 (randomizer)
  │
  ├── CAM-10 (AI interface)
  │     ├── CAM-11 (Anthropic provider)
  │     ├── CAM-12 (character prompt)  ──► CAM-14
  │     └── CAM-13 (script prompt)    ──► CAM-15
  │
  ├── CAM-26 (Zod schemas) ──► CAM-14, CAM-15
  │
  ├── CAM-14 (characters endpoint) ──┐
  │                                  ├── CAM-23 (useCampaign)
  ├── CAM-15 (script endpoint)  ────┘        │
  │                                          ├── CAM-19 (WizardStepper)
  ├── CAM-6 (Pinia store) ─────────────────┘ ├── CAM-21 (CharacterGrid)
  │                                           └── CAM-22 (GmScript)
  │
  └── CAM-24/25 (pages)  ◄── all components
```
