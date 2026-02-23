# Phase 4 — API Endpoints

## What it builds

Phase 4 exposes the Phase 2–3 pipeline over HTTP. The two endpoints are thin wires: validate input → call the randomizer → call the AI service → parse and return typed JSON. No new logic lives here; all the interesting work is already in `server/services/`.

---

## What you have coming in (Phase 3 output)

- `generateRandomDistinctCharacters(count)` → `CharacterTemplate[]`
- `buildCharacterPrompt(template, setting)` → `AIPrompt`
- `buildScriptPrompt(characters, setting)` → `AIPrompt`
- `getAIProvider().complete(prompt)` → `Promise<AICompletionResult>`
- `AICompletionResult.text` is a raw string — it may be JSON, but it is not parsed by the provider

The smoke test in `server/tests/smoke.test.ts` exercises the same pipeline end-to-end and is worth reading as a reference for the assembly pattern.

---

## CAM-26 — Zod validation schemas (`server/utils/validate.ts`)

Both endpoints share a `setting` field. Define the Zod schemas for the two request bodies.

**Characters endpoint request:**
```ts
{
  playerCount: number  // int, 1–9 (max distinct archetype–suit combos)
  setting: Genre[]     // at least one genre; values from GenreGroups
}
```

**Script endpoint request:**
```ts
{
  characters: CharacterSheet[]  // at least one character
  setting: Genre[]
}
```

`Genre` is `(typeof GenreGroups)[GenreGroup][number]` — a flat union of all the string literals in `GenreGroups`. Build the Zod enum from `Object.values(GenreGroups).flat()`.

`CharacterSheet` contains `I18nKey` and `GeneratedText` branded types (both are `string` at runtime). Use `z.string()` for those fields; the brands are compile-time only.

Keep all schemas in `server/utils/validate.ts` and export them. The endpoint files import only what they need.

---

## CAM-14 — `POST /api/campaign/characters`

**File:** `server/api/campaign/characters.post.ts`

**Pipeline:**

```
readBody(event)
  → validate with charactersRequestSchema (throw 422 on failure)
  → generateRandomDistinctCharacters(playerCount)         // CharacterTemplate[]
  → for each template in parallel:
      getAIProvider().complete(buildCharacterPrompt(template, setting))
        → parseAIJson<CharacterIdentity>(result.text)     // see JSON parsing below
        → merge template + identity → CharacterSheet
  → return CharacterSheet[]
```

The character AI calls are independent — run them in parallel with `Promise.all`.

**Response shape:** `CharacterSheet[]` (the full type from `shared/types/character.ts`)

**Registering the provider:** `getAIProvider()` reads from the registry populated at import time by each provider module. Import the provider files at the top of the endpoint file (or from a shared server plugin) so `registerProvider()` has been called before `getAIProvider()` runs:

```ts
import "~~/server/services/ai/anthropic";
import "~~/server/services/ai/ollama";
```

Both imports are unconditional — the factory selects the active one at runtime via `runtimeConfig.ai.provider`.

---

## CAM-15 — `POST /api/campaign/script`

**File:** `server/api/campaign/script.post.ts`

**Pipeline:**

```
readBody(event)
  → validate with scriptRequestSchema (throw 422 on failure)
  → getAIProvider().complete(buildScriptPrompt(characters, setting))
      → parseAIJson<GameMasterScript>(result.text)
  → return GameMasterScript
```

**Response shape:** `GameMasterScript` from `shared/types/campaign.ts`:

```ts
{
  hook: GeneratedText
  targets: { king: TargetEnemy; queen: TargetEnemy; jack: TargetEnemy }
  weakPoints: { name: GeneratedText; role: GeneratedText }[]  // exactly 10
  scenes: GeneratedText[]
  centralTension: GeneratedText
}
```

---

## JSON parsing

The AI provider returns raw text. Some models wrap the JSON in a markdown code block (` ```json … ``` `); others emit the word `undefined` where the JSON spec requires `null`. The smoke test already contains a working `extractJson` helper that handles both cases. Extract it into a shared utility, e.g. `server/utils/parseAIJson.ts`, so both endpoints use it without duplicating the logic.

Suggested signature:

```ts
export function parseAIJson<T>(raw: string): T
```

Throw a structured error if `JSON.parse` fails (see CAM-27).

---

## CAM-27 — Structured error handling

Use Nuxt's `createError` to return consistent error objects. The relevant failure modes and their HTTP status codes:

| Failure | Status | Notes |
|---|---|---|
| Zod validation fails | 422 | Include `data: zodError.errors` in the response |
| AI provider not configured / invalid key | 502 | Rethrow as Bad Gateway; do not expose the raw SDK error message |
| AI returns unparseable JSON | 502 | Log the raw AI text server-side for debugging; return a generic message to the client |
| `generateRandomDistinctCharacters` throws (count > max distinct combos) | 422 | Unprocessable — the client sent an out-of-range `playerCount` |
| Unexpected error | 500 | Re-throw as-is; Nuxt will serialize it |

Wrap the entire pipeline in each endpoint handler in a `try/catch`. Distinguish between known error classes (Zod's `ZodError`, JSON `SyntaxError`) and unknowns.

---

## Files to create

| File | Ticket |
|---|---|
| `server/utils/validate.ts` | CAM-26 |
| `server/utils/parseAIJson.ts` | CAM-26 / CAM-27 |
| `server/api/campaign/characters.post.ts` | CAM-14 |
| `server/api/campaign/script.post.ts` | CAM-15 |

---

## Exit criteria

Both endpoints return correct typed payloads when called with valid input:

```bash
# Characters
curl -s -X POST http://localhost:3000/api/campaign/characters \
  -H "Content-Type: application/json" \
  -d '{"playerCount":3,"setting":["cyberpunk"]}' | jq '.[0].characterIdentity.name'

# Script
curl -s -X POST http://localhost:3000/api/campaign/script \
  -H "Content-Type: application/json" \
  -d '{"characters":[...],"setting":["cyberpunk"]}' | jq '.hook'
```

And return structured errors for invalid input:

```bash
# Should return 422
curl -s -X POST http://localhost:3000/api/campaign/characters \
  -H "Content-Type: application/json" \
  -d '{"playerCount":99,"setting":[]}' | jq '.statusCode'
```
