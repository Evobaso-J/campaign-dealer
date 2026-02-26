# Phase 5 — Client State & Orchestration

## What it builds

Phase 5 establishes the full client-side data pipeline. No UI components yet — just the Pinia store that holds campaign state and a `useCampaign` composable that orchestrates the two API calls (characters → script) and writes the results into the store. Once this phase is done, any future page or component can call `useCampaign().generateCampaign(...)` and reactively render the results.

---

## What you have coming in (Phase 4 output)

- `POST /api/campaign/characters` — accepts `{ playerCount, setting, language }`, returns `CharacterSheet[]`
- `POST /api/campaign/script` — accepts `{ characters, setting, language }`, returns `GameMasterScript`
- Both endpoints validate with Zod and return structured errors (422 for validation, 502 for AI failures)
- The Pinia store at `app/stores/campaign.ts` exists but only declares bare reactive state with no actions or getters

---

## CAM-6 — Expand the Pinia campaign store (`app/stores/campaign.ts`)

The store skeleton already exists. Flesh it out with actions and getters that the composable and future UI components will consume.

**State:**

```ts
const playerCount = ref(0);
const campaignSetting = ref<Genre[]>([]);
const characters = ref<CharacterSheet[]>([]);
const gmScript = ref<GameMasterScript | undefined>();
const generationStatus = ref<GenerationStatus>("idle");
const errorMessage = ref<string | undefined>();
```

`GenerationStatus` expands to track both generation stages:

```ts
type GenerationStatus =
  | "idle"
  | "generating-characters"
  | "generating-script"
  | "done"
  | "error";
```

**Actions:**

| Action | Purpose |
|---|---|
| `setInput(count, setting)` | Stores the wizard selections before generation begins |
| `setCharacters(sheets)` | Writes the character array; transitions status to `generating-script` |
| `setScript(script)` | Writes the GM script; transitions status to `done` |
| `setError(message)` | Stores the error message; transitions status to `error` |
| `$reset()` | Resets all state back to `idle` — use Pinia's built-in if setup stores support it, or implement manually |

Actions only hold state-mutation logic. They do **not** call `$fetch` — the composable owns that.

**Getters:**

| Getter | Returns |
|---|---|
| `isLoading` | `true` when status is `generating-characters` or `generating-script` |
| `hasResult` | `true` when status is `done` |
| `campaign` | A computed `Campaign` object assembled from the individual refs (setting, characters, script), or `undefined` if not `done` |

**Notes:**

- Import `Genre` from `~~/shared/types/campaign` — Nuxt 4 auto-imports from `shared/types/`.
- Expose every ref and every action/getter from the store's return object.
- The store must remain a **setup store** (the current `defineStore(id, () => { ... })` pattern). Do not convert to an options store.

---

## CAM-23 — `useCampaign` composable (`app/composables/useCampaign.ts`)

The composable is the single entry point for the generation flow. It wraps `$fetch`, manages the store's status transitions, and handles errors.

**File:** `app/composables/useCampaign.ts`

Nuxt 4 auto-imports composables from `app/composables/`, so no manual registration is needed.

**Public API:**

```ts
function useCampaign() {
  const store = useCampaignStore();

  async function generateCampaign(
    playerCount: number,
    setting: Genre[],
  ): Promise<void>;

  function reset(): void;

  return { generateCampaign, reset, store };
}
```

**`generateCampaign` pipeline:**

```
store.$reset() or store.setError(undefined)
store.setInput(playerCount, setting)
store.generationStatus = "generating-characters"

const locale = useNuxtApp().$i18n.locale.value  // "en" | "it"

① $fetch<CharacterSheet[]>("/api/campaign/characters", {
     method: "POST",
     body: { playerCount, setting, language: locale },
   })
   → store.setCharacters(result)

② $fetch<GameMasterScript>("/api/campaign/script", {
     method: "POST",
     body: { characters: store.characters, setting, language: locale },
   })
   → store.setScript(result)

catch → store.setError(error.data?.message ?? error.message)
```

The two calls are **sequential** — step ② needs the characters from step ①.

**Language:** The composable reads the current i18n locale via `useNuxtApp().$i18n.locale` (or the `useI18n` composable) and forwards it as the `language` field in both API requests. This keeps locale awareness centralised in the composable rather than expecting every caller to pass it.

**Error handling:**

- `$fetch` throws `FetchError` for non-2xx responses. The error object has `.data` containing the server's `createError` payload.
- Extract the user-facing message from `error.data?.message` when present; fall back to `error.message`.
- Always transition the store to `error` status on failure, regardless of which step failed. If characters succeeded but script failed, the characters remain in the store so users can retry the script step without re-generating characters (see optional enhancement below).

**`reset`:** Delegates to `store.$reset()` — clears all state back to idle.

---

## Testing strategy

### Unit tests for the store (`test/unit/campaign-store.test.ts` or co-located)

Test the store in isolation with `setActivePinia(createPinia())`:

- `setInput` writes `playerCount` and `campaignSetting`
- `setCharacters` updates `characters` and transitions status
- `setScript` updates `gmScript` and transitions to `done`
- `setError` sets `errorMessage` and status to `error`
- `$reset` returns everything to initial state
- `isLoading` returns `true` only during generation statuses
- `hasResult` returns `true` only when `done`

### Nuxt integration test for the composable (`test/nuxt/useCampaign.test.ts`)

Use `@nuxt/test-utils` with `registerEndpoint` from `@nuxt/test-utils/runtime` to mock the two API endpoints:

```ts
registerEndpoint("/api/campaign/characters", {
  method: "POST",
  handler: () => mockCharacters,
});
registerEndpoint("/api/campaign/script", {
  method: "POST",
  handler: () => mockScript,
});
```

Then exercise `generateCampaign()` and assert that the store transitions through the expected statuses and ends with the mock data.

Test the error path by registering an endpoint that returns a 422 or 502 and verifying the store ends in `error` status.

---

## Files to create / modify

| File | Ticket | Action |
|---|---|---|
| `app/stores/campaign.ts` | CAM-6 | **Modify** — expand with actions, getters, richer status |
| `app/composables/useCampaign.ts` | CAM-23 | **Create** |
| `test/unit/campaign-store.test.ts` | CAM-6 | **Create** |
| `test/nuxt/useCampaign.test.ts` | CAM-23 | **Create** |

---

## Optional enhancement — partial retry

If character generation succeeds but script generation fails, the composable could expose a `retryScript()` method that re-runs only step ② using the characters already in the store. This avoids burning an extra AI call for the character step. Not required for the phase exit criteria but worth considering during implementation.

---

## Exit criteria

Calling `useCampaign().generateCampaign(3, ["cyberpunk"])` from a test (or a temporary debug page) results in:

1. The store's `generationStatus` transitions through `generating-characters` → `generating-script` → `done`
2. `store.characters` contains 3 `CharacterSheet` objects
3. `store.gmScript` is a valid `GameMasterScript`
4. `store.isLoading` is `false` and `store.hasResult` is `true`
5. Calling `reset()` returns the store to `idle` with all data cleared
6. Passing invalid input (e.g., `playerCount: 99`) results in `generationStatus === "error"` with a meaningful `errorMessage`
