# Frontend Module

> **Level 2 module instructions.** Load this when the task involves Vue components, styling, i18n, or client-side state.

## File inventory

| File / directory                 | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `app/components/`                | Vue components organized by feature               |
| `app/composables/`               | Async orchestration (useCampaign, useTheme, etc.) |
| `app/stores/campaign.ts`         | Pinia store: campaign state across wizard steps   |
| `app/assets/css/`                | Global styles, Tailwind theme                     |
| `app/utils/`                     | Client-side utilities (suitIcons, genreConfig)    |
| `i18n/locales/en.json`           | English locale                                    |
| `i18n/locales/it.json`           | Italian locale                                    |
| `brain/frontend/decisions.jsonl` | Past UI/frontend decisions                        |

## Visual design system

**Game Boy pixel-art, 1-bit aesthetic, CRT monitor feel:**

- Pixel font throughout (Press Start 2P)
- 4-shade palette: background → shadow → midtone → highlight
- Hard pixel borders (2–4px, no border-radius)
- CRT scanline overlay on the **viewport root only** — never on individual components
- Card suit motifs (spades, hearts, clubs) as decorative elements
- Palette shifts based on selected genre
- Navigation buttons: highlight shade as background, background shade as text
- Error state: full-width pixel-art alert with `⚠` icon

### Genre palettes

| Genre                        | Visual character                  |
| ---------------------------- | --------------------------------- |
| Dark Fantasy / Gothic Horror | Near-black purple → pale lavender |
| Cyberpunk / Sci-Fi           | Near-black teal → bright cyan     |
| High Fantasy                 | Dark forest → pale gold           |
| Horror / Cosmic Horror       | Near-black red → sickly green     |
| Steampunk / Dieselpunk       | Soot black → burnished gold       |
| Weird West / Wuxia           | Desert night → sand               |

Exact hex values live in `app/assets/css/` (Tailwind `@theme` block). Use genre names, not hex values, in discussions.

## Tailwind v4 rules

- Use `@theme` block for CSS variable overrides, **not** `:root`
- The theme defines the 4-shade palette as CSS custom properties
- All UI chrome uses only palette shades — no external colors

## i18n rules

`@nuxtjs/i18n` is configured with `en` (default) and `it` locales.

- All user-facing text uses i18n keys via `t("key.path")`
- Locale files use **natural case** (e.g., "Choose your setting")
- Apply uppercase via CSS (`text-transform: uppercase`), never in locale strings
- Both `en.json` and `it.json` must be updated together
- Skill names/descriptions from the rulebook follow the same copyright restriction as `characterTemplates.ts`

## Component patterns

- **Wizard flow**: `WizardStepper` orchestrates 4 steps (CharacterSelector → SettingForm → CharacterGrid → GmScript)
- **Composables** handle async: call server APIs, write to Pinia store, expose loading/error
- **Components** are presentational: read from store or props, emit events
- **Store** persists wizard state across navigation

## Data flow (client side)

```
User interaction → composable method → $fetch to server API → store action → reactive render
```

<instructions>
- Never call AI providers from the client. All AI calls go through server API endpoints.
- Always use i18n keys for user-facing text. Never hardcode strings in templates.
- Use `@theme` for Tailwind v4 CSS variables, never `:root`.
- Keep locale strings in natural case. Apply uppercase via CSS only.
- Test component logic with `--project nuxt`, pure logic with `--project unit`.
- Follow the 4-shade palette system. See the genre palettes table above for visual character per genre.
- When adding components, follow the existing pattern: props/emits for data flow, store for shared state.
</instructions>
