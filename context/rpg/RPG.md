# RPG

<!-- exodia:section:intro -->
Mechanics for "The House Doesn't Always Win". Game data is **copyright-protected** and lives in `server/data/houseDoesntWin/` (git-ignored on public clones; a `*.example.ts` documents the shape). Read this when modifying character generation, archetypes, suits, skills, or randomizer behavior.

## File Inventory

<!-- exodia:section:files -->

| File                                               | Purpose                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| `shared/types/character.ts`                        | Character types and branded helpers                               |
| `shared/utils/characterRandomizer.ts`              | Pure logic: `CharacterTemplate` from archetype + suit             |
| `server/data/houseDoesntWin/characterTemplates.ts` | Game data (git-ignored): archetype skill pools, characterizations |
| `server/services/ai/prompts/character.ts`          | Builds the prompt from template + setting → identity              |
| `server/services/ai/prompts/script.ts`             | Builds the GM campaign-script prompt                              |

## Generation Split

<!-- exodia:section:split -->
The pipeline keeps **mechanical** (deterministic) separate from **narrative** (AI):

- Mechanical layer (`characterRandomizer.ts`): picks archetype, suit, skills. Pure, instant, testable without AI.
- AI layer (`prompts/character.ts`): receives `CharacterTemplate` + setting → produces `CharacterIdentity` via the active provider.

Outcome: mechanics are reproducible; identity always fits the campaign genre (a cyberpunk run gets cyberpunk names, not fantasy ones).

## Game Structure

<!-- exodia:section:structure -->
- **Archetypes**: King, Queen, Jack — each owns an archetype skill pool.
- **Suits**: Hearts, Clubs, Spades — each owns a suit skill plus a "characterization" string.
- **9 combos** = 3 archetypes × 3 suits; every combo is a unique build.
- **Party**: 1–4 characters, no duplicate combos.
- **Diamonds** is intentionally excluded from players (antagonist motif).

## Type Boundaries

<!-- exodia:section:types -->
- `CharacterTemplate` = `CharacterSheet` minus `characterIdentity`, plus `suitCharacterization` and `archetypeCharacterization`.
- `CharacterIdentity.*` fields use the `GeneratedText` brand.
- `CharacterSkill.name` and `.description` use the `I18nKey` brand (resolved on the frontend).

See `shared/types/utils.ts` for brand definitions.

## Operating Rules

<!-- exodia:section:rules -->
- Never hardcode identity text. Identity is always AI-generated.
- Skill names/descriptions must be `I18nKey`, never raw strings.
- Randomizer stays pure: no async, no I/O, no AI calls.
- `characterTemplates.ts` is copyrighted text; do not commit publicly.
- New RPG systems → new `server/data/<system-name>/` directory + randomizer config flag. The randomizer never branches on system inline.
- Always write tests for randomizer changes (`--project unit` or `--project server`).

## L3 Data

<!-- exodia:section:l3 -->
- `decisions.jsonl`: past game-design decisions (mechanical/narrative split, branded types, party constraints).
