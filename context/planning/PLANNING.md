# Planning

<!-- exodia:section:intro -->
Roadmap, phase status, and component contracts. Phase data is the source of truth in `phases.jsonl` and `tasks.jsonl` — this file describes the **shape** of planning, not the live state.

## How to use this module

<!-- exodia:section:usage -->
1. Check `phases.jsonl` to see what is in progress and what is done.
2. Check `tasks.jsonl` (filtered by current phase) for ticket-level work.
3. When starting work, `status` flips to `in_progress`. When finished, append a new entry with `"status": "done"` (do not edit the original).
4. Cross-reference with Linear ticket IDs (`CAM-*`) when available.

## Wizard Flow

<!-- exodia:section:wizard -->

| Step | Component           | Generation trigger                                     |
| ---- | ------------------- | ------------------------------------------------------ |
| 1    | `CharacterSelector` | None — user selects archetype+suit combos              |
| 2    | `SettingForm`       | None — user picks genres                               |
| 3    | `CharacterGrid`     | On entry: `generateCharacters(templates, genres)`      |
| 4    | `GmScript`          | On entry: `generateScript(genres)`                     |

`WizardStepper` orchestrates navigation, fires generation at step transitions, and surfaces loading/error.

## Component Contracts

<!-- exodia:section:contracts -->

| Component           | File                                   | Props                                            | Emits                                 |
| ------------------- | -------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| `CharacterSelector` | `app/components/CharacterSelector.vue` | `modelValue: CharacterTemplate[]`                | `update:modelValue` (on "Lock Party") |
| `SettingForm`       | `app/components/SettingForm.vue`       | `modelValue: Genre[]`                            | `update:modelValue`                   |
| `CharacterSheet`    | `app/components/CharacterSheet.vue`    | `character: CharacterSheet`, `loading?: boolean` | `reroll`                              |
| `CharacterGrid`     | `app/components/CharacterGrid.vue`     | none (reads store)                               | none                                  |
| `GmScript`          | `app/components/GmScript.vue`          | none (reads store)                               | none                                  |
| `WizardStepper`     | `app/components/WizardStepper.vue`     | none                                             | none                                  |

## Re-roll Architecture

<!-- exodia:section:reroll -->
Single-character regeneration without disturbing the rest of the party.

- **Endpoint** `POST /api/campaign/characters/reroll` — file: `server/api/campaign/characters/reroll.post.ts` (*not yet implemented*). Accepts `{ archetype, suit, setting, language }`, returns one `CharacterSheet`.
- **Shared utility** (`shared/utils/characterRandomizer.ts`):
  - `generateCharacterTemplate(archetype, suit)` — done; deterministic re-roll picks a fresh random archetype skill.
  - `allCombinations()` — *not yet implemented*; returns all 9 archetype × suit pairs for `CharacterSelector`.
- **Store** (`app/stores/campaign.ts`): `replaceCharacter(index, sheet)` swaps one character in place.
- **Composable** (`app/composables/useCampaign.ts`): `rerollCharacter(index)` reads combo from store, calls endpoint, calls `replaceCharacter`.

## Adding a Phase

<!-- exodia:section:add-phase -->
1. Append to `phases.jsonl` with `"status": "in_progress"`.
2. Append per-ticket entries to `tasks.jsonl`.
3. When the phase ends, append a fresh `phases.jsonl` entry with `"status": "done"` (don't edit the original; append-only rule).

## L3 Data

<!-- exodia:section:l3 -->
- `phases.jsonl`: development phases in dependency order.
- `tasks.jsonl`: task-level tracking per phase (ticket → file → action → status).
- `decisions.jsonl`: planning-related decisions (e.g. wizard shape).
