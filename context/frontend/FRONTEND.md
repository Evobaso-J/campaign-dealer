# Frontend

<!-- exodia:section:intro -->
Vue 3 + Nuxt 4 client. Game Boy pixel-art aesthetic with a 4-shade genre-driven palette. State lives in Pinia; composables own async; components are presentational; i18n is mandatory for user-facing text.

## File Inventory

<!-- exodia:section:files -->

| File / directory          | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `app/components/`         | Vue components organized by feature                    |
| `app/composables/`        | Async orchestration (`useCampaign`, `useTheme`, …)     |
| `app/stores/campaign.ts`  | Pinia store: wizard state across steps                 |
| `app/assets/css/`         | Global styles, Tailwind theme (`@theme` block)         |
| `app/utils/`              | Client utilities (`suitIcons`, `genreConfig`, …)       |
| `i18n/locales/en.json`    | English locale (default)                               |
| `i18n/locales/it.json`    | Italian locale                                         |

## Visual Design System

<!-- exodia:section:design -->
Game Boy / 1-bit / CRT feel:

- Pixel font (Press Start 2P) throughout.
- 4-shade palette per genre: background → shadow → midtone → highlight.
- Hard pixel borders (2–4px), no border-radius.
- CRT scanline overlay applied to the **viewport root only**, never per component.
- Card-suit motifs (spades, hearts, clubs) as decorative elements.
- Navigation buttons: highlight shade as background, background shade as text.
- Error state: full-width pixel-art alert with `⚠`.

### Genre Palettes

| Genre family                  | Visual character                  |
| ----------------------------- | --------------------------------- |
| Dark Fantasy / Gothic Horror  | Near-black purple → pale lavender |
| Cyberpunk / Sci-Fi            | Near-black teal → bright cyan     |
| High Fantasy                  | Dark forest → pale gold           |
| Horror / Cosmic Horror        | Near-black red → sickly green     |
| Steampunk / Dieselpunk        | Soot black → burnished gold       |
| Weird West / Wuxia            | Desert night → sand               |

Hex values live in `app/assets/css/`. Refer to genres by name, never hex.

## Tailwind v4 Rules

<!-- exodia:section:tailwind -->
- Use `@theme` block (not `:root`) for CSS variable overrides.
- Theme defines the 4-shade palette as CSS custom properties.
- UI chrome uses only palette shades — no external colors.
- Override Nuxt UI variables inside `@layer theme { .light { } }`, not in unlayered CSS.
- Never use `!important` (or Tailwind `!`) to win specificity; resolve at the root.

## i18n Rules

<!-- exodia:section:i18n -->
`@nuxtjs/i18n` configured with `en` (default) + `it`.

- All user-facing text uses `t("key.path")`.
- Locale files use **natural case** (e.g. "Choose your setting").
- Apply uppercase via CSS (`text-transform: uppercase`), never in locale strings.
- `en.json` and `it.json` must be updated together.
- Skill names/descriptions follow the same copyright restriction as `characterTemplates.ts`.

## Component Patterns

<!-- exodia:section:components -->
- **Wizard flow**: `WizardStepper` → 4 steps (`CharacterSelector` → `SettingForm` → `CharacterGrid` → `GmScript`).
- **Composables** handle async: call server, write to store, expose `loading` / `error`.
- **Components** are presentational: read store / props, emit events.
- **Store** persists wizard state across navigation.
- Always prefer Nuxt UI components (`UButton`, `UBadge`, `UCard`, `UModal`, `UIcon`, …) over raw HTML when an equivalent exists.

## Data Flow

<!-- exodia:section:dataflow -->

```text
User interaction → composable method → $fetch to server API → store action → reactive render
```

## Operating Rules

<!-- exodia:section:rules -->
- Never call AI providers from the client — every AI call goes through a server endpoint.
- Always use i18n keys for user-facing text.
- `@theme` for Tailwind v4 CSS vars; never `:root`.
- Locale strings stay natural-cased; uppercase via CSS only.
- Component logic → `--project nuxt`; pure logic → `--project unit`.
- Check Tailwind built-ins before authoring custom CSS utilities.

## L3 Data

<!-- exodia:section:l3 -->
- `decisions.jsonl`: past UI/design decisions (palette system, scanline placement, wizard shell, locale-case rule).
