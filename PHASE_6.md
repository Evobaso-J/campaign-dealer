# Phase 6 — UI Components

## What it builds

Phase 6 creates the full UI layer: a 4-step wizard and the individual display components for characters and GM scripts. It also adds a **re-roll** feature (regenerate a single character's AI identity without touching the others), which requires a thin new server endpoint and a composable method. All UI text uses i18n keys from the start.

---

## What you have coming in (Phase 5 output)

- Pinia store (`app/stores/campaign.ts`) with state, actions (`setInput`, `setCharacters`, `setScript`, `setError`, `reset`), and getters (`isLoading`, `hasResult`, `campaign`)
- `useCampaign` composable (`app/composables/useCampaign.ts`) exposing `generateCharacters(playerCount, setting)` and `generateScript(setting)` — two separate sequential calls
- `POST /api/campaign/characters` — accepts `{ playerCount, setting, language }`, returns `CharacterSheet[]`
- `POST /api/campaign/script` — accepts `{ characters, setting, language }`, returns `GameMasterScript`
- NuxtUI 4.4.0 + TailwindCSS 4.2.1 fully configured
- i18n with `en` and `it` locales (currently only `skills.*` keys)
- A test page at `app/pages/index.vue` that exercises the full flow inline — treat it as a reference, not as production code

---

## Wizard flow

| Step | Component          | What happens                                                              |
| ---- | ------------------ | ------------------------------------------------------------------------- |
| 1    | `PlayerCountInput` | Pick player count (1–6)                                                   |
| 2    | `SettingForm`      | Pick genres (checkboxes grouped by category); at least 1 required         |
| 3    | `CharacterGrid`    | Generate characters on entry; display cards; re-roll individual character |
| 4    | `GmScript`         | Generate script on entry; display full campaign results                   |

`WizardStepper` orchestrates step navigation, triggers generation at the right moments, and shows loading/error states.

---

## Re-roll: server endpoint

The existing bulk endpoint (`POST /api/campaign/characters`) picks random archetype+suit combos. Re-rolling a single character needs to regenerate a **specific** archetype+suit with a fresh AI identity.

### New function in `server/services/rpg/characterRandomizer.ts`

```ts
export const generateCharacterTemplate = (
  archetype: CharacterArchetype,
  suit: CharacterSuit,
): CharacterTemplate => { ... }
```

Same logic as `generateCharacter()` but deterministic — uses the provided archetype+suit instead of randomizing. Still picks one random archetype skill from the pool (so re-rolls feel fresh).

Refactor: extract the shared body of `generateCharacter()` and `generateCharacterTemplate()` into a common internal helper to avoid duplication.

### New validation schema in `server/utils/validate.ts`

```ts
export const rerollRequestSchema = z.object({
  archetype: z.enum(archetypes),
  suit: z.enum(suits),
  setting: settingSchema,
  language: z.enum(Locales),
});
```

### New endpoint: `server/api/campaign/characters/reroll.post.ts`

```
POST /api/campaign/characters/reroll
Body: { archetype, suit, setting, language }
Returns: CharacterSheet (single object, not array)
```

Implementation follows the same pattern as `characters.post.ts`:

1. Validate body with `rerollRequestSchema`
2. Call `generateCharacterTemplate(archetype, suit)`
3. `buildCharacterPrompt({ template, setting, language })`
4. `provider.complete(prompt)` → parse → validate
5. Return merged `CharacterSheet`

---

## Store & composable changes

### `app/stores/campaign.ts` — add `replaceCharacter`

```ts
function replaceCharacter(index: number, sheet: CharacterSheet) {
  characters.value[index] = sheet;
}
```

Expose it in the store's return object.

### `app/composables/useCampaign.ts` — add `rerollCharacter`

```ts
async function rerollCharacter(index: number): Promise<void>;
```

1. Read `store.characters[index]` → get `archetype`, `suit`
2. `$fetch<CharacterSheet>("/api/campaign/characters/reroll", { method: "POST", body: { archetype, suit, setting: store.campaignSetting, language: locale } })`
3. On success: `store.replaceCharacter(index, result)`
4. On error: `store.setError(message)` (same pattern as existing error handling)

This function does **not** change `generationStatus` — the wizard stays on step 3.

Return `rerollCharacter` from the composable alongside `generateCharacters` and `generateScript`.

---

## i18n keys

### Add `ui` section to `app/i18n/locales/en.json` and `app/i18n/locales/it.json`

```json
{
  "ui": {
    "wizard": {
      "step1Title": "How many players?",
      "step2Title": "Choose your setting",
      "step3Title": "Your characters",
      "step4Title": "Campaign script",
      "next": "Next",
      "back": "Back",
      "generate": "Generate Characters",
      "generateScript": "Generate Script",
      "reroll": "Re-roll",
      "reset": "Start Over"
    },
    "playerCount": {
      "label": "Number of players",
      "hint": "1 to 6 players"
    },
    "setting": {
      "label": "Select genres",
      "groups": {
        "fantasy": "Fantasy",
        "scifi": "Sci-Fi",
        "horror": "Horror",
        "modern": "Modern",
        "cultural": "Cultural",
        "aesthetic": "Aesthetic"
      }
    },
    "character": {
      "weapon": "Weapon",
      "instrument": "Instrument",
      "concealed": "concealed",
      "suitSkill": "Suit skill",
      "archetypeSkills": "Archetype skills",
      "uses": "{left}/{max} uses"
    },
    "script": {
      "hook": "Hook",
      "centralTension": "Central Tension",
      "plot": "Plot",
      "targets": "Antagonist Targets",
      "scenes": "Scenes",
      "weakPoints": "Weak Points"
    },
    "status": {
      "generating": "Generating...",
      "error": "Something went wrong"
    }
  }
}
```

Italian translations follow the same structure with appropriate translations.

---

## CAM-17 — `PlayerCountInput.vue`

**File:** `app/components/PlayerCountInput.vue`

- Props: `modelValue: number`
- Emits: `update:modelValue`
- Template:
  - `UFormField` with `t("ui.playerCount.label")` as label
  - `UInputNumber` bound to `modelValue`, min=1, max=6
  - Hint text: `t("ui.playerCount.hint")`

---

## CAM-18 — `SettingForm.vue`

**File:** `app/components/SettingForm.vue`

- Props: `modelValue: Genre[]`
- Emits: `update:modelValue`
- Template:
  - Label: `t("ui.setting.label")`
  - Iterates `Object.entries(GenreGroups)` — each entry renders:
    - Group heading: `t("ui.setting.groups." + groupKey)`
    - `UCheckbox` per genre in the group, bound via computed getter/setter that emits the updated array

---

## CAM-20 — `CharacterSheet.vue`

**File:** `app/components/CharacterSheet.vue`

- Props: `character: CharacterSheet`, `loading?: boolean`
- Emits: `reroll`
- Template (`UCard`):
  - **Header:** name, pronouns (if present), archetype `UBadge`, suit `UBadge`, re-roll `UButton` (emits `reroll`, shows `:loading="loading"`)
  - **Body:**
    - Concept (italic paragraph, if present)
    - Weapon + instrument row with concealed `UBadge` (if present)
    - `USeparator`
    - Suit skill: name (bold, via `t()`) — description (via `t()`)
    - Archetype skills: `<ul>` with name (bold, via `t()`) — description (via `t()`) — uses display if present

---

## CAM-21 — `CharacterGrid.vue`

**File:** `app/components/CharacterGrid.vue`

- No props — reads from `useCampaignStore()` directly
- Internal state: `rerollingIndex: ref<number | null>(null)` — tracks which character is being re-rolled
- Template:
  - Responsive grid: `grid-cols-1 md:grid-cols-2 gap-4`
  - `CharacterSheet` per character, passing `:loading="rerollingIndex === i"` and handling `@reroll` → calls `useCampaign().rerollCharacter(i)`, managing `rerollingIndex` around the await

---

## CAM-22 — `GmScript.vue`

**File:** `app/components/GmScript.vue`

- No props — reads `store.gmScript` from `useCampaignStore()`
- Template: series of `UCard` sections, each with an icon + translated heading:
  - **Hook** (`i-lucide-anchor`) — italic paragraph
  - **Central Tension** (`i-lucide-zap`) — paragraph
  - **Plot** (`i-lucide-book-open`) — paragraph
  - **Targets** (`i-lucide-crosshair`) — iterate `["king", "queen", "jack"]`, show archetype badge + name + description + fate badge
  - **Scenes** (`i-lucide-film`) — numbered `<ol>` with count badge in header
  - **Weak Points** (`i-lucide-shield-off`) — 2-column grid with name (bold) + role (subtitle), count badge in header

All section headings use `t("ui.script.<key>")`.

---

## CAM-19 — `WizardStepper.vue`

**File:** `app/components/WizardStepper.vue`

- Internal state:
  - `currentStep: ref(1)` — 1 through 4
  - `playerCount: ref(2)`
  - `selectedGenres: ref<Genre[]>([])`
- Reads store for status/error display
- Uses `useCampaign()` for `generateCharacters`, `generateScript`

**Step indicator:**

- A horizontal row of 4 steps (number + label from `t("ui.wizard.step<N>Title")`)
- Active step highlighted, completed steps marked

**Step rendering:**

- Step 1: `<PlayerCountInput v-model="playerCount" />`
- Step 2: `<SettingForm v-model="selectedGenres" />`
- Step 3: `<CharacterGrid />`
- Step 4: `<GmScript />`

**Navigation logic:**

- Step 1 → 2: always allowed (Next button)
- Step 2 → 3: requires `selectedGenres.length > 0`; on transition, calls `generateCharacters(playerCount, selectedGenres)`. Characters generate in the background while the user sees step 3 with a loading state
- Step 3 → 4: requires `store.characters.length > 0` and `!store.isLoading`; on transition, calls `generateScript(selectedGenres)`. Script generates while user sees step 4 with a loading state
- Back button goes to previous step (always enabled on steps 2–4)
- Navigation buttons disabled while `store.isLoading`

**Error handling:**

- `UAlert` shown when `store.errorMessage` is set, with `t("ui.status.error")` title and `store.errorMessage` as description

---

## Files to create / modify

| File                                            | Ticket | Action                                                                |
| ----------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `server/services/rpg/characterRandomizer.ts`    | —      | **Modify** — add `generateCharacterTemplate()`, refactor shared logic |
| `server/utils/validate.ts`                      | —      | **Modify** — add `rerollRequestSchema`                                |
| `server/api/campaign/characters/reroll.post.ts` | —      | **Create**                                                            |
| `app/stores/campaign.ts`                        | —      | **Modify** — add `replaceCharacter()`                                 |
| `app/composables/useCampaign.ts`                | —      | **Modify** — add `rerollCharacter()`                                  |
| `app/i18n/locales/en.json`                      | —      | **Modify** — add `ui.*` keys                                          |
| `app/i18n/locales/it.json`                      | —      | **Modify** — add `ui.*` keys                                          |
| `app/components/PlayerCountInput.vue`           | CAM-17 | **Create**                                                            |
| `app/components/SettingForm.vue`                | CAM-18 | **Create**                                                            |
| `app/components/WizardStepper.vue`              | CAM-19 | **Create**                                                            |
| `app/components/CharacterSheet.vue`             | CAM-20 | **Create**                                                            |
| `app/components/CharacterGrid.vue`              | CAM-21 | **Create**                                                            |
| `app/components/GmScript.vue`                   | CAM-22 | **Create**                                                            |

---

## Exit criteria

1. Starting the dev server (`pnpm dev`) and opening the app shows the 4-step wizard
2. Step 1: player count input works, Next advances to step 2
3. Step 2: genre checkboxes are grouped by category with translated group headings, at least 1 genre required to proceed
4. Step 2 → 3 transition: triggers character generation; step 3 shows loading state then renders character cards
5. Step 3: each character card shows name, pronouns, concept, weapon/instrument, skills with i18n translations; re-roll button regenerates a single character without touching the others
6. Step 3 → 4 transition: triggers script generation; step 4 shows loading state then renders all GM script sections
7. Step 4: hook, central tension, plot, targets (with archetype badges), scenes (numbered), weak points (2-column grid) all render correctly
8. Switching locale to `it` translates all UI labels and skill text
9. Error states (e.g., AI failure) display a user-facing error alert and don't break the wizard
