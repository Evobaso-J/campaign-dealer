# Planning Module

> **Level 2 module instructions.** Load this when the task involves the dev roadmap, current phase, or component implementation details.

## Current state

Phase 8 (Polish — i18n completion + README) is **in progress**. Phases 1–7 are done. Check `brain/planning/phases.jsonl` for per-phase status and `brain/planning/tasks.jsonl` for task-level detail.

## Phase 5 outputs (available when picking up Phase 6+ work)

- Pinia store (`app/stores/campaign.ts`) — state, actions (`setInput`, `setCharacters`, `setScript`, `setError`, `reset`), getters (`isLoading`, `hasResult`)
- `useCampaign` composable — `generateCharacters(templates, setting)` and `generateScript(setting)`
- `POST /api/campaign/characters` — accepts `{ templates: CharacterTemplate[], setting, language }`, returns `CharacterSheet[]`
- `POST /api/campaign/script` — accepts `{ characters, setting, language }`, returns `GameMasterScript`
- i18n with `en` and `it` locales

## Wizard flow

| Step | Component           | Generation trigger                                     |
| ---- | ------------------- | ------------------------------------------------------ |
| 1    | `CharacterSelector` | None — user selects archetype+suit combos              |
| 2    | `SettingForm`       | None — user picks genres                               |
| 3    | `CharacterGrid`     | On step entry: `generateCharacters(templates, genres)` |
| 4    | `GmScript`          | On step entry: `generateScript(genres)`                |

`WizardStepper` orchestrates navigation, triggers generation at step transitions, and manages loading/error states.

## Re-roll architecture

Single-character regeneration without touching others.

**Endpoint** `POST /api/campaign/characters/reroll`:

- Input: `{ archetype, suit, setting, language }`
- Output: single `CharacterSheet`
- File: `server/api/campaign/characters/reroll.post.ts` ← **not yet implemented**

**Shared utility** (`shared/utils/characterRandomizer.ts`):

- `generateCharacterTemplate(archetype, suit)` → `CharacterTemplate` (deterministic, re-roll picks a fresh random archetype skill) ← **done**
- `allCombinations()` → all 9 archetype×suit pairs (used by `CharacterSelector`) ← **not yet implemented**

**Store** (`app/stores/campaign.ts`): `replaceCharacter(index, sheet)` — updates one character in place
**Composable** (`app/composables/useCampaign.ts`): `rerollCharacter(index)` — reads archetype+suit from store, calls endpoint, calls `replaceCharacter`

## Component contracts

| Component           | File                                   | Props                                            | Emits                                 |
| ------------------- | -------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| `CharacterSelector` | `app/components/CharacterSelector.vue` | `modelValue: CharacterTemplate[]`                | `update:modelValue` (on "Lock Party") |
| `SettingForm`       | `app/components/SettingForm.vue`       | `modelValue: Genre[]`                            | `update:modelValue`                   |
| `CharacterSheet`    | `app/components/CharacterSheet.vue`    | `character: CharacterSheet`, `loading?: boolean` | `reroll`                              |
| `CharacterGrid`     | `app/components/CharacterGrid.vue`     | none (reads store)                               | none                                  |
| `GmScript`          | `app/components/GmScript.vue`          | none (reads store)                               | none                                  |
| `WizardStepper`     | `app/components/WizardStepper.vue`     | none                                             | none                                  |

## Adding a new phase spec

When starting a new phase:

1. Append a new entry to `brain/planning/phases.jsonl` with `"status": "in_progress"`
2. Update this file's "Current state" section
3. Add task entries to `brain/planning/tasks.jsonl` for each ticket in the phase
4. Mark Phase 8 as `"done"` in phases.jsonl when complete

<instructions>
- Check phases.jsonl before starting work to understand what's done vs in progress.
- Check tasks.jsonl for the current phase to identify what's todo.
- When a task is completed, append a new entry with "status": "done" (do not modify the original).
- Re-roll endpoint and allCombinations() are not yet implemented — see tasks.jsonl.
</instructions>
