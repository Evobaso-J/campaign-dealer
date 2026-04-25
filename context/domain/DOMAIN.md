# Domain

<!-- exodia:section:intro -->
Campaign Dealer generates tabletop RPG content for "The House Doesn't Always Win" — a card-suit-based RPG. Each player picks a card-archetype/suit combo; the system generates a full character sheet (mechanics + AI-generated identity) and a Game Master script for a campaign.

## Entities

<!-- exodia:section:entities -->

| Entity              | Definition                                                  | Source of truth              |
| ------------------- | ----------------------------------------------------------- | ---------------------------- |
| `CharacterSheet`    | Playable character: archetype + suit + skills + identity    | `shared/types/character.ts`  |
| `CharacterTemplate` | Mechanical scaffold: a `CharacterSheet` without identity    | `shared/types/character.ts`  |
| `CharacterIdentity` | AI-generated narrative wrap (name, pronouns, weapon, …)     | `shared/types/character.ts`  |
| `GameMasterScript`  | Generated campaign: introduction, targets, rumors, weapons  | `shared/types/campaign.ts`   |
| `TargetEnemy`       | Antagonist per player archetype                             | `shared/types/campaign.ts`   |
| `Genre`             | Setting flavor (≈20 across fantasy / sci-fi / horror / …)   | `shared/types/campaign.ts`   |
| `CharacterCombo`    | An `archetype × suit` pair selected during party building   | `shared/types/character.ts`  |
| `GeneratedText`     | Branded type for AI-produced strings                        | `shared/types/utils.ts`      |
| `I18nKey`           | Branded type for keys resolved client-side via i18n         | `shared/types/utils.ts`      |

## Relationships

<!-- exodia:section:relationships -->

```text
Party (1..4)
  └── CharacterCombo (archetype × suit, no duplicates)
        └── CharacterTemplate (mechanical, deterministic)
              └── CharacterSheet (template + AI identity)

GameMasterScript
  ├── targets: { king, queen, jack } → TargetEnemy
  ├── rumors[]
  └── weapons[] / instruments[] (setting-appropriate)
```

- 3 archetypes × 3 suits = 9 unique combos; party size 1–4 with no duplicates.
- Diamonds is intentionally excluded from player suits (reserved for antagonist motifs).

## User Journey

<!-- exodia:section:journey -->
1. Pick `CharacterCombo` set (party of 1–4).
2. Pick `Genre` mix (setting flavor).
3. System generates `CharacterSheet[]` (one AI call per character).
4. System generates `GameMasterScript` (one AI call seeded with characters + setting).
5. Optional: re-roll a single character.

## Type System

<!-- exodia:section:types -->
All shared types live under `shared/types/` and are auto-imported by Nuxt 4 on both client and server. Branded types (`GeneratedText`, `I18nKey`) keep AI-output strings, i18n keys, and raw strings type-distinct so they cannot be silently swapped. Zod schemas in `server/utils/validate.ts` validate the inbound API surface.

## L3 Data

<!-- exodia:section:l3 -->
- `glossary.yaml`: extended terminology, archetype/suit semantics, and synonyms.
