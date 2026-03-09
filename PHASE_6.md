# Phase 6 — UI Components

## What it builds

Phase 6 creates the full UI layer: a 4-step wizard and the individual display components for characters and GM scripts. It also adds a **re-roll** feature (regenerate a single character's AI identity without touching the others), which requires a thin new server endpoint and a composable method. All UI text uses i18n keys from the start.

---

## What you have coming in (Phase 5 output)

- Pinia store (`app/stores/campaign.ts`) with state, actions (`setInput`, `setCharacters`, `setScript`, `setError`, `reset`), and getters (`isLoading`, `hasResult`, `campaign`)
- `useCampaign` composable (`app/composables/useCampaign.ts`) exposing `generateCharacters(templates, setting)` and `generateScript(setting)` — two separate sequential calls
- `POST /api/campaign/characters` — accepts `{ templates: CharacterTemplate[], setting, language }`, returns `CharacterSheet[]`
- `POST /api/campaign/script` — accepts `{ characters, setting, language }`, returns `GameMasterScript`
- NuxtUI 4.4.0 + TailwindCSS 4.2.1 fully configured
- i18n with `en` and `it` locales (currently only `skills.*` keys)
- A test page at `app/pages/index.vue` that exercises the full flow inline — treat it as a reference, not as production code

---

## Wizard flow

| Step | Component           | What happens                                                                 |
| ---- | ------------------- | ---------------------------------------------------------------------------- |
| 1    | `CharacterSelector` | Select party of up to 4 characters (archetype+suit combos); randomize option |
| 2    | `SettingForm`       | Pick genres (checkboxes grouped by category); at least 1 required            |
| 3    | `CharacterGrid`     | Generate characters on entry; display cards; re-roll individual character    |
| 4    | `GmScript`          | Generate script on entry; display full campaign results                      |

`WizardStepper` orchestrates step navigation, triggers generation at the right moments, and shows loading/error states.

---

## Re-roll: server endpoint

The existing bulk endpoint (`POST /api/campaign/characters`) picks random archetype+suit combos. Re-rolling a single character needs to regenerate a **specific** archetype+suit with a fresh AI identity.

### New functions in `shared/utils/characterRandomizer.ts`

```ts
export const generateCharacterTemplate = (
  archetype: CharacterArchetype,
  suit: CharacterSuit,
): CharacterTemplate => { ... }
```

Same logic as `generateCharacter()` but deterministic — uses the provided archetype+suit instead of randomizing. Still picks one random archetype skill from the pool (so re-rolls feel fresh).

Refactor: extract the shared body of `generateCharacter()` and `generateCharacterTemplate()` into a common internal helper to avoid duplication.

```ts
/** Returns all 9 archetype-suit combinations. */
export const allCombinations = (): Array<{ archetype: CharacterArchetype; suit: CharacterSuit }> => { ... }
```

`allCombinations()` enumerates the 3×3 grid. Both `allCombinations` and `generateCharacterTemplate` are pure functions importable from the client (used by `CharacterSelector`).

### Updated validation schema in `server/utils/validate.ts`

Update `charactersRequestSchema` to accept `templates` instead of `playerCount`:

```ts
export const charactersRequestSchema = z.object({
  templates: z.array(characterTemplateSchema).min(1).max(4),
  setting: settingSchema,
  language: z.enum(Locales),
});
```

Add `rerollRequestSchema`:

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

Update `characters.post.ts`: the endpoint no longer calls `generateRandomDistinctCharacters()`. Instead it receives `templates` from the client and uses them directly for AI identity generation.

The re-roll endpoint implementation follows the same pattern as `characters.post.ts`:

1. Validate body with `rerollRequestSchema`
2. Call `generateCharacterTemplate(archetype, suit)`
3. `buildCharacterPrompt({ template, setting, language })`
4. `provider.complete(prompt)` → parse → validate
5. Return merged `CharacterSheet`

---

## Store & composable changes

### `app/stores/campaign.ts` — update `setInput`, add `replaceCharacter`

```ts
function setInput(templates: CharacterTemplate[], setting: Genre[]) {
  playerCount.value = templates.length;
  campaignSetting.value = setting;
}
```

The store keeps `playerCount` as a derived value (`templates.length`) for any code that still reads it. Add a new `selectedTemplates: ref<CharacterTemplate[]>([])` state field to hold the client-chosen templates (needed by re-roll to know the original archetype+suit).

```ts
function replaceCharacter(index: number, sheet: CharacterSheet) {
  characters.value[index] = sheet;
}
```

Expose both in the store's return object.

### `app/composables/useCampaign.ts` — update `generateCharacters`, add `rerollCharacter`

The `generateCharacters` signature changes to accept templates instead of a player count:

```ts
async function generateCharacters(
  templates: CharacterTemplate[],
  setting: Genre[],
): Promise<void>;
```

1. `store.setInput(templates, setting)`
2. `$fetch<CharacterSheet[]>("/api/campaign/characters", { method: "POST", body: { templates, setting, language: locale } })`
3. On success: `store.setCharacters(result)`
4. On error: `store.setError(message)`

```ts
async function rerollCharacter(index: number): Promise<void>;
```

1. Read `store.characters[index]` → get `archetype`, `suit`
2. `$fetch<CharacterSheet>("/api/campaign/characters/reroll", { method: "POST", body: { archetype, suit, setting: store.campaignSetting, language: locale } })`
3. On success: `store.replaceCharacter(index, result)`
4. On error: `store.setError(message)` (same pattern as existing error handling)

This function does **not** change `generationStatus` — the wizard stays on step 3.

Return `generateCharacters`, `rerollCharacter`, and `generateScript` from the composable.

---

## i18n keys

### Add `ui` section to `app/i18n/locales/en.json` and `app/i18n/locales/it.json`

```json
{
  "ui": {
    "wizard": {
      "step1Title": "Deploy your party tokens",
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
    "selector": {
      "title": "Select Character",
      "drawRandom": "Draw Random",
      "lockParty": "Lock Party",
      "empty": "EMPTY",
      "loadOut": "LOAD OUT",
      "characters": "CHARACTERS",
      "archetype": {
        "king": "King",
        "queen": "Queen",
        "jack": "Jack"
      },
      "suit": {
        "hearts": "Hearts",
        "clubs": "Clubs",
        "spades": "Spades"
      }
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

## CAM-17 — `CharacterSelector.vue`

**File:** `app/components/CharacterSelector.vue`

The user assembles a party of 1–4 characters by choosing archetype+suit combinations. Skills are randomized client-side on selection. The output is an array of `CharacterTemplate` objects that the wizard passes forward.

### Props / Emits

- Props: `modelValue: CharacterTemplate[]`
- Emits: `update:modelValue` (emitted when the user clicks "Lock Party")

### Internal state

```ts
const MAX_PARTY = 4;

// All 9 possible characters (3 archetypes × 3 suits), generated once via allCombinations()
const allCharacters: Array<{
  archetype: CharacterArchetype;
  suit: CharacterSuit;
}>;

// Set of selected combo keys, e.g. "jack-hearts"
const selected = ref<Set<string>>(new Set());

// Map from combo key to its generated CharacterTemplate (skills randomized on selection)
const templates = ref<Map<string, CharacterTemplate>>(new Map());
```

- `partySize: computed` — `selected.value.size`
- `canSelect: computed` — `selected.value.size < MAX_PARTY`
- `canLock: computed` — `selected.value.size >= 1`
- `comboKey(archetype, suit)` — helper returning `"${archetype}-${suit}"`

### Selection behavior

Clicking an unselected character **toggles it on** (if `canSelect`). Clicking a selected character **toggles it off**. When a character is toggled on, `generateCharacterTemplate(archetype, suit)` is called immediately and stored in `templates` — this randomizes which archetype skill they get. Toggling off removes the entry from both `selected` and `templates`.

Since the list is fixed (all 9 combos are always visible), **no two characters can be the same by construction** — each combo appears exactly once.

### Template layout

Two-panel layout on `md+`, stacked on mobile:

```
┌─────────────────────────────────────────────────────────┐
│  SELECT CHARACTER                           PART ACTIVE │
│                                                         │
│  ┌─ Left panel ──────────┐  ┌─ Right panel ────────────┐│
│  │                        │  │                          ││
│  │  ♥ HEARTS              │  │  ┌──────┐  ┌──────┐     ││
│  │  [x] Jack ♥            │  │  │Card 1│  │Card 2│     ││
│  │  [ ] Queen ♥           │  │  └──────┘  └──────┘     ││
│  │  [ ] King ♥            │  │  ┌──────┐  ┌──────┐     ││
│  │                        │  │  │Card 3│  │Card 4│     ││
│  │  ♣ CLUBS               │  │  └──────┘  └──────┘     ││
│  │  [ ] Jack ♣            │  │                          ││
│  │  [x] Queen ♣           │  │                          ││
│  │  [ ] King ♣            │  │                          ││
│  │                        │  │                          ││
│  │  ♠ SPADES              │  │                          ││
│  │  [ ] Jack ♠            │  │                          ││
│  │  [ ] Queen ♠           │  │                          ││
│  │  [x] King ♠            │  │                          ││
│  │                        │  │                          ││
│  └────────────────────────┘  └──────────────────────────┘│
│                                                          │
│  LOAD OUT: 6  |  # CHARACTERS: 3                         │
│                                                          │
│            [🎲 DRAW RANDOM]       [🔒 LOCK PARTY]        │
└─────────────────────────────────────────────────────────┘
```

### Left panel — Character list

The 9 characters are grouped by suit (hearts, clubs, spades). Each group has:

- A suit heading: `t("ui.selector.suit.<suit>")` with suit icon
- 3 rows, one per archetype (jack, queen, king)

Each row renders:

- `UCheckbox` — `:model-value="selected.has(key)"`, disabled when `!canSelect && !selected.has(key)` (i.e., party is full and this character isn't already selected)
- Label: `t("ui.selector.archetype.<archetype>")` + suit icon
- When checked, the row gets a subtle highlight (`terminal-panel` background)

### Right panel — Card previews

A `grid-cols-2 gap-2` grid showing 4 card slots (always 4, regardless of selection count). Each card is a `div` with `pixel-border` styling:

- **Empty slot:** dashed border, muted text `t("ui.selector.empty")`
- **Filled slot:** shows archetype badge (`crt-badge`), suit icon, and the randomized archetype skill name via `t(template.archetypeSkills[0].name)`

Cards are populated in selection order (first selected = card 1, etc.).

### Stats bar

A horizontal row below the grid:

- `t("ui.selector.loadOut")`: X — sum of all skills across selected characters (each contributes 1 suit skill + 1 archetype skill = 2)
- `t("ui.selector.characters")`: Y — `partySize`

Uses `crt-badge` styling for the numbers.

### Action buttons

- **DRAW RANDOM** (`UButton` variant `outline`) — `t("ui.selector.drawRandom")`
  - Disabled when `!canSelect` (party is full)
  - Picks **one** random character from the unselected pool and toggles it on (generating its template with randomized skills)
  - Pressing multiple times adds one more random character each time, up to `MAX_PARTY`

- **LOCK PARTY** (`UButton` variant `solid`, primary) — `t("ui.selector.lockParty")`
  - Disabled unless `canLock` is true
  - Collects templates for all selected characters (in selection order)
  - Emits `update:modelValue` with the `CharacterTemplate[]` array

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
  - `selectedTemplates: ref<CharacterTemplate[]>([])`
  - `selectedGenres: ref<Genre[]>([])`
- Reads store for status/error display
- Uses `useCampaign()` for `generateCharacters`, `generateScript`

**Step indicator:**

- A horizontal row of 4 steps (number + label from `t("ui.wizard.step<N>Title")`)
- Active step highlighted, completed steps marked

**Step rendering:**

- Step 1: `<CharacterSelector v-model="selectedTemplates" />`
- Step 2: `<SettingForm v-model="selectedGenres" />`
- Step 3: `<CharacterGrid />`
- Step 4: `<GmScript />`

**Navigation logic:**

- Step 1 → 2: requires `selectedTemplates.length > 0` (party must be locked)
- Step 2 → 3: requires `selectedGenres.length > 0`; on transition, calls `generateCharacters(selectedTemplates, selectedGenres)`. Characters generate in the background while the user sees step 3 with a loading state
- Step 3 → 4: requires `store.characters.length > 0` and `!store.isLoading`; on transition, calls `generateScript(selectedGenres)`. Script generates while user sees step 4 with a loading state
- Back button goes to previous step (always enabled on steps 2–4)
- Navigation buttons disabled while `store.isLoading`

**Error handling:**

- `UAlert` shown when `store.errorMessage` is set, with `t("ui.status.error")` title and `store.errorMessage` as description

---

## Files to create / modify

| File                                            | Ticket | Action                                                                                                      |
| ----------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `shared/utils/characterRandomizer.ts`           | CAM-17 | **Modify** — add `generateCharacterTemplate()`, `allCombinations()`                                         |
| `server/utils/validate.ts`                      | —      | **Modify** — update `charactersRequestSchema` (templates instead of playerCount), add `rerollRequestSchema` |
| `server/api/campaign/characters.post.ts`        | —      | **Modify** — use provided `templates` instead of `generateRandomDistinctCharacters()`                       |
| `server/api/campaign/characters/reroll.post.ts` | —      | **Create**                                                                                                  |
| `app/stores/campaign.ts`                        | —      | **Modify** — update `setInput()` to accept templates, add `replaceCharacter()`                              |
| `app/composables/useCampaign.ts`                | —      | **Modify** — update `generateCharacters()` signature, add `rerollCharacter()`                               |
| `i18n/locales/en.json`                          | —      | **Modify** — add `ui.selector.*` keys, update `ui.wizard.step1Title`                                        |
| `i18n/locales/it.json`                          | —      | **Modify** — add `ui.selector.*` keys, update `ui.wizard.step1Title`                                        |
| `app/components/CharacterSelector.vue`          | CAM-17 | **Create**                                                                                                  |
| `app/components/SettingForm.vue`                | CAM-18 | **Create**                                                                                                  |
| `app/components/WizardStepper.vue`              | CAM-19 | **Modify** — replace `playerCount` with `selectedTemplates`, render `CharacterSelector`                     |
| `app/components/CharacterSheet.vue`             | CAM-20 | **Create**                                                                                                  |
| `app/components/CharacterGrid.vue`              | CAM-21 | **Create**                                                                                                  |
| `app/components/GmScript.vue`                   | CAM-22 | **Create**                                                                                                  |

---

## Exit criteria

1. Starting the dev server (`pnpm dev`) and opening the app shows the 4-step wizard
2. Step 1: character selector lets users pick up to 4 unique archetype+suit combos; "Randomize Party" fills all 4 slots; skills are randomized on selection; "Lock Party" advances to step 2; no two characters can share the same archetype+suit
3. Step 2: genre checkboxes are grouped by category with translated group headings, at least 1 genre required to proceed
4. Step 2 → 3 transition: triggers character generation; step 3 shows loading state then renders character cards
5. Step 3: each character card shows name, pronouns, concept, weapon/instrument, skills with i18n translations; re-roll button regenerates a single character without touching the others
6. Step 3 → 4 transition: triggers script generation; step 4 shows loading state then renders all GM script sections
7. Step 4: hook, central tension, plot, targets (with archetype badges), scenes (numbered), weak points (2-column grid) all render correctly
8. Switching locale to `it` translates all UI labels and skill text
9. Error states (e.g., AI failure) display a user-facing error alert and don't break the wizard
