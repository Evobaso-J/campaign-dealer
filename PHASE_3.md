# Phase 3 — AI Service Layer

## What it builds

Phase 3 bridges the pure-logic randomizer output from Phase 2 with a final, fully-populated `CharacterSheet`. It also prepares the machinery to generate the GM script. Nothing in this phase touches the UI or the API endpoints — those come in Phase 4.

---

## What you have coming in (Phase 2 output)

The randomizer now returns a `CharacterTemplate`, which is a `CharacterSheet` **minus** `characterIdentity`, **plus** two extra context strings:

```ts
CharacterTemplate = {
  archetype: "jack" | "queen" | "king"
  suit: "hearts" | "clubs" | "spades"
  damage: { hearts: false, clubs: false, spades: false }
  modifiers: { hearts: -1, clubs: 1, spades: 0 }  // example
  suitSkill: CharacterSkill     // i18n key, no free text
  archetypeSkills: CharacterSkill[]
  suitCharacterization: string  // "Clubs characters lead with their body..."
  archetypeCharacterization: string  // "The Jack is more at ease on the front line..."
}
```

The `characterIdentity` block — `name`, `pronouns`, `concept`, `weapon`, `instrument` — is typed as `GeneratedText`, a branded string that signals it was produced by an AI, not fetched from a fixed table. Phase 3 is what produces those values.

---

## CAM-10 — `AIProvider` interface + factory (`server/services/ai/index.ts`)

This is the most architecturally important piece. It defines the contract that every AI backend must satisfy, so the rest of the codebase never imports a specific SDK directly.

```ts
export interface AIProvider {
  complete(prompt: { system: string; user: string }): Promise<string>
  stream(prompt: { system: string; user: string }): AsyncIterable<string>
}
```

The `complete()` method is what Phase 3–4 use. `stream()` is defined now but wired in a later scaling step — defining it here costs nothing and keeps the interface stable.

The factory reads `useRuntimeConfig()` (Nuxt's server-only runtime config, backed by `.env`) and returns the right implementation:

```ts
export const getAIProvider = (): AIProvider => {
  const config = useRuntimeConfig()
  if (config.aiProvider === "anthropic") return new AnthropicProvider(config.anthropicApiKey)
  throw new Error(`Unknown AI provider: ${config.aiProvider}`)
}
```

This means calling code (`characters.post.ts`, `script.post.ts` in Phase 4) never mentions Anthropic by name. Swapping to OpenAI or a local Ollama instance later is a one-file addition.

---

## CAM-11 — Anthropic provider (`server/services/ai/anthropic.ts`)

This is the only file in the codebase that imports `@anthropic-ai/sdk`. It implements `AIProvider` by wrapping the Messages API:

- Receives `{ system, user }` strings from the prompt builders
- Passes them to `client.messages.create()` with a fixed model (e.g. `claude-sonnet-4-6`) and a reasonable `max_tokens`
- Returns the raw text of the first content block

The provider does **not** parse JSON — that responsibility belongs to the calling code. Keeping parsing out of the provider means the same provider works for both character generation (expects JSON) and GM script generation (expects JSON with a different shape), without any branching inside the provider itself.

---

## CAM-12 — Character prompt builder (`server/services/ai/prompts/character.ts`)

The prompt builder takes a `CharacterTemplate` + a campaign `setting` string and returns `{ system: string; user: string }`.

**Why this needs its own file:** prompts are iterable artifacts. The mechanical logic (randomizer) and the AI plumbing (provider) are both stable; the prompts are what you tune. Isolating them means you can improve one without touching anything else.

**What the system prompt does:** sets the AI's persona as a creative writing assistant for a tabletop RPG. It establishes the output contract: respond only with a JSON object matching `CharacterIdentity`, no prose outside the JSON block.

**What the user prompt does:** provides the context the AI needs to produce a result that is *specific to this character and this campaign*:

```
Archetype: Jack
Archetype characterization: "The Jack is more at ease on the front line..."

Suit: Clubs
Suit characterization: "Clubs characters lead with their body and their will..."

Campaign setting: [user-provided string, e.g. "1920s Chicago speakeasy run by a supernatural crime boss"]

Generate a CharacterIdentity for this character. Return only valid JSON matching this shape:
{
  "name": string,
  "pronouns": string | null,
  "concept": string,
  "weapon": { "name": string, "concealed": boolean } | null,
  "instrument": { "name": string, "concealed": boolean } | null
}
```

The characterizations from `characterTemplates.ts` (the `suitCharacterization` and `archetypeCharacterization` fields on the skeleton) are the key inputs here — they provide flavour that makes the AI-generated identity coherent with the game mechanics, not generic.

---

## CAM-13 — GM script prompt builder (`server/services/ai/prompts/script.ts`)

This builder takes the array of generated `CharacterSheet`s (after identity is filled in) and the campaign setting, and returns `{ system: string; user: string }` for generating a `GameMasterScript`.

The `GameMasterScript` type (from `shared/types/campaign.ts`) has:

```ts
type GameMasterScript = {
  hook: GeneratedText
  weakPoints: { name: GeneratedText; role: GeneratedText; motive: GeneratedText }[]
  scenes: GeneratedText[]
  centralTension: GeneratedText
}
```

The user prompt summarizes the full party — each character's name, archetype, suit, and concept — so the AI can write a session-zero script that is tailored to *this group* in *this setting*. The system prompt instructs it to return a JSON object matching the `GameMasterScript` shape.

---

## Exit criteria

> Calling `getAIProvider().complete(characterPrompt)` against a randomizer-generated skeleton returns a JSON-parseable `CharacterSheet` with a fully populated `characterIdentity` appropriate to the campaign setting and archetype/suit combination.

The practical test:

1. Call `generateCharacter()` from Phase 2 → get a `CharacterTemplate`
2. Pass it + a setting string into `buildCharacterPrompt(template, setting)` → get `{ system, user }`
3. Pass those into `getAIProvider().complete(prompt)` → get back a JSON string
4. `JSON.parse()` the response → must satisfy the `CharacterIdentity` shape with no missing required fields

Phase 4 will add Zod validation to formally enforce that contract at the API boundary. In Phase 3, a manual test or a simple unit test with a real API call is sufficient to confirm the pipeline works end-to-end.

---

## Files to create

| File | Ticket |
|---|---|
| `server/services/ai/index.ts` | CAM-10 |
| `server/services/ai/anthropic.ts` | CAM-11 |
| `server/services/ai/prompts/character.ts` | CAM-12 |
| `server/services/ai/prompts/script.ts` | CAM-13 |

Also add `ANTHROPIC_API_KEY` and `AI_PROVIDER` to `nuxt.config.ts` under `runtimeConfig` (server-only), and add those keys to `.env.example`.
