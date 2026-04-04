# RPG Module

> **Level 2 module instructions.** Load this when the task involves game mechanics, character generation, or RPG data.

## File inventory

| File                                               | Purpose                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `shared/types/character.ts`                        | Character types: `CharacterSheet`, `CharacterTemplate`, branded types  |
| `shared/utils/characterRandomizer.ts`              | Pure logic: generates `CharacterTemplate` from archetype+suit combos   |
| `server/data/houseDoesntWin/characterTemplates.ts` | Game data (git-ignored): archetype skill pools, suit characterizations |
| `server/services/ai/prompts/character.ts`          | Prompt builder that takes skeleton + setting → AI identity             |
| `server/services/ai/prompts/script.ts`             | Prompt builder for GM campaign script                                  |
| `brain/rpg/decisions.jsonl`                        | Past game-design decisions and their reasoning                         |

## Character generation split

The system separates **mechanical** (deterministic) from **narrative** (AI-generated):

- **Mechanical layer** (`characterRandomizer.ts`): picks archetype, suit, skills from fixed tables → produces `CharacterTemplate`
- **AI layer** (`prompts/character.ts`): receives `CharacterTemplate` + campaign setting → generates `CharacterIdentity` (name, pronouns, concept, weapon, instrument)

This split means:

- Mechanics are instant, testable without API calls, and reproducible
- Identity always fits the campaign setting (a cyberpunk character gets a cyberpunk name, not a fantasy one)

## Key types

- `CharacterTemplate` = `CharacterSheet` without `characterIdentity`, plus `suitCharacterization` and `archetypeCharacterization` strings
- `CharacterIdentity` fields are `GeneratedText` (branded type marking AI output)
- `CharacterSkill.name` and `.description` are `I18nKey` (resolved on frontend)

### Branded types (`shared/types/utils.ts`)

- `GeneratedText` — marks strings produced by AI (never from fixed tables)
- `I18nKey` — marks strings that are i18n keys resolved on the frontend (skill names/descriptions)

### Game data (`server/data/houseDoesntWin/`)

`characterTemplates.ts` contains text derived from a commercial rulebook and is **git-ignored on public repos**. A `characterTemplates.example.ts` with placeholder values documents the expected shape for new contributors. The actual file must never be committed publicly.

## Game structure

- **3 archetypes**: King, Queen, Jack — each with a pool of archetype skills
- **3 suits**: Hearts, Clubs, Spades — each with a suit skill and characterization
- **9 combinations**: every archetype × suit is a unique character build
- **Party size**: 1–4 characters, no duplicates

<instructions>
- Never hardcode character identity text. Identity is always AI-generated.
- Skill names and descriptions must be i18n keys, never raw strings.
- When modifying the randomizer, keep it pure (no side effects, no async, no AI calls).
- `characterTemplates.ts` contains copyrighted text — never commit it to public repos.
- New RPG systems go in `server/data/<system-name>/` — the randomizer selects based on config.
- Always write tests for randomizer changes (`--project unit` or `--project server`).
</instructions>
