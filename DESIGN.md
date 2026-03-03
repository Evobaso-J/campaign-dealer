# Design Prompt — Campaign Dealer UI Mockup

> Prompt for Google Stitch (or equivalent AI mockup tool).

---

## Context

**Campaign Dealer** is a web app that generates tabletop RPG campaigns using AI. It is themed around "The House Doesn't Always Win", a card-suit-based RPG. The UI is a 4-step wizard: pick player count → pick genres → view generated characters → view GM script.

---

## Visual Style

**Game Boy–style pixel art, 1-bit aesthetic, CRT monitor feel.**

- **Pixel font** throughout — blocky, no anti-aliasing (like Press Start 2P)
- **4-shade palette** — no gradients, only flat fill blocks chosen from a tight monochromatic ramp (background → shadow → midtone → highlight)
- **Hard pixel borders** — 2–4 px thick, no border-radius, no drop shadows (replace with offset pixel shadow in palette color)
- **CRT overlay** — subtle horizontal scanlines (thin repeating dark stripes) layered over the entire viewport, plus a very slight vignette at screen edges
- **Pixel icons** — all icons are 16×16 or 32×32 pixel-art glyphs (no vector/SVG smoothness)
- **Uppercase labels** — section headings and button labels are ALL-CAPS pixel text
- **Card suit motifs** — ♠ ♥ ♦ ♣ used as decorative elements and archetype indicators

---

## Palette Rules (Genre-Based)

The 4-shade palette shifts based on the genres selected in Step 2. Show **two palette variants** side by side to demonstrate the system:

| Genre theme                      | Shade 1 (bg)                | Shade 2 (shadow)       | Shade 3 (mid)            | Shade 4 (highlight)      |
| -------------------------------- | --------------------------- | ---------------------- | ------------------------ | ------------------------ |
| **Dark Fantasy / Gothic Horror** | near-black purple `#0d0010` | deep violet `#3b1f52`  | muted amethyst `#7d5a8a` | pale lavender `#d4b8e0`  |
| **Cyberpunk / Sci-Fi**           | near-black teal `#001214`   | dark cyan `#0d3b42`    | electric teal `#1fa8b5`  | bright cyan `#7ffffa`    |
| **High Fantasy**                 | dark forest `#051a00`       | deep green `#1a4d00`   | sage `#4a8f3f`           | pale gold `#e8d87a`      |
| **Horror / Cosmic Horror**       | near-black red `#100005`    | dark crimson `#3d0010` | blood red `#8b0020`      | sickly green `#a8e84a`   |
| **Steampunk / Dieselpunk**       | soot black `#0f0c00`        | dark brass `#3d2e00`   | aged copper `#8b6914`    | burnished gold `#e8c44a` |
| **Weird West / Wuxia**           | desert night `#100a00`      | burnt sienna `#3d1a00` | terracotta `#8b4020`     | sand `#e8c87a`           |

> In the mockup: show **Dark Fantasy** palette as the primary example; use **Cyberpunk** palette as the alternate/comparison swatch.

---

## Screen 1 — Step Indicator (persistent, top of every screen)

A horizontal pixel-art progress bar spanning the full width:

```
[ 1 PLAYERS ] ──▶── [ 2 SETTING ] ──▶── [ 3 CHARACTERS ] ──▶── [ 4 SCRIPT ]
```

- Each step is a square pixel chip: filled = active (highlight color), outlined = pending (shadow color), checkmark glyph = completed
- Connecting lines are dashed pixel lines
- Current step label is visible below its chip; non-active step labels are dimmer

---

## Screen 1 — Step 1: Player Count

Title: `HOW MANY PLAYERS?`

- A large pixel-art number in the center of the screen (e.g., "3"), flanked by `[−]` and `[+]` pixel buttons
- Below: a row of 6 small humanoid pixel silhouettes; the first N are lit in highlight color, the rest are dim
- Below that: hint text `1 TO 6 PLAYERS` in small pixel font
- Bottom bar: `[ NEXT ▶ ]` button, right-aligned, in highlight color with pixel border

---

## Screen 2 — Step 2: Setting / Genre Picker

Title: `CHOOSE YOUR SETTING`

Six genre groups arranged in a 2-column grid of labeled sections. Each section has:

- A pixel-art section header (e.g., `▸ FANTASY`, `▸ SCI-FI`, `▸ HORROR`, `▸ MODERN`, `▸ CULTURAL`, `▸ AESTHETIC`)
- A list of checkboxes per genre — pixel-art toggle: `[■]` checked, `[ ]` unchecked
- Genre names in small pixel caps (e.g., `HIGH FANTASY`, `DARK FANTASY`, `CYBERPUNK`, `COSMIC HORROR`)

Bottom bar: `[ ◀ BACK ]` left, `[ NEXT ▶ ]` right (disabled/dimmed if no genre is selected)

> Show a state where 2 genres from different groups are checked (e.g., DARK FANTASY + CYBERPUNK).

---

## Screen 3 — Step 3: Character Cards

Title: `YOUR CHARACTERS`

A 2-column responsive grid of character cards. Each card is a pixel-art bordered rectangle:

**Card anatomy:**

```
┌────────────────────────────────────────┐
│ ♠  ELARA VOSS  (she/her)   [REROLL ⟳] │
│ [ SWORDBOUND ] [ SPADES ]              │
├────────────────────────────────────────┤
│ *A weary duelist haunted by a*         │
│ *broken oath from her former guild.*   │
│                                        │
│ WEAPON:  Rapier  [concealed]           │
│ INSTR:   Fiddle                        │
│ ────────────────────────────────────── │
│ SUIT SKILL                             │
│ ■ RIPOSTE — Mirror an enemy's attack   │
│                                        │
│ ARCHETYPE SKILLS                       │
│ ■ DUELIST'S FLOW — 3/3 ●●●            │
│ ■ IRON WILL — 2/2 ●●                  │
└────────────────────────────────────────┘
```

- Suit symbol (♠ ♥ ♦ ♣) is a large pixel glyph in the top-left corner of each card
- Archetype and suit are pixel-art badge chips
- Skill use counters: filled pixel circles `●` for remaining uses, empty `○` for spent
- `[REROLL ⟳]` is a small pixel button in the card header; loading state shows a spinning pixel animation
- Show 4 cards in the grid (2×2)

Bottom bar: `[ ◀ BACK ]` left, `[ GENERATE SCRIPT ▶ ]` right

> Also show one card in **loading state** (header and body replaced by flickering pixel scanline animation / "░░░░░░░░" placeholder blocks)

---

## Screen 4 — Step 4: GM Script

Title: `CAMPAIGN SCRIPT`

A series of full-width pixel-bordered section cards stacked vertically:

| Section                | Pixel icon       | Content preview                                                                                                           |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **HOOK**               | ⚓ anchor        | Italic paragraph of flavour text                                                                                          |
| **CENTRAL TENSION**    | ⚡ lightning     | Short paragraph                                                                                                           |
| **PLOT**               | 📖 open book     | Paragraph                                                                                                                 |
| **ANTAGONIST TARGETS** | ✛ crosshair      | 3 sub-cards: KING / QUEEN / JACK each with name, description, fate badge (`[CAPTURED]`, `[CONVERTED]`, or `[ELIMINATED]`) |
| **SCENES**             | 🎞 film strip    | Numbered list `01. ... 02. ...` with scene count badge in header `[10]`                                                   |
| **WEAK POINTS**        | 🛡 broken shield | 2-column grid of name (bold) + role (dim subtext), count badge `[10]` in header                                           |

All section headings are `ALL-CAPS PIXEL FONT` with the pixel icon to the left.

Bottom bar: `[ ◀ BACK ]` left, `[ START OVER ↺ ]` right

---

## Additional Notes for the Mockup Tool

1. **Show both palette variants** (Dark Fantasy and Cyberpunk) — either as two separate artboards or as a split-screen comparison.
2. The CRT scanline overlay must be visible on all screens.
3. All UI chrome (buttons, borders, badges) uses only the 4 palette shades — no external colors.
4. Navigation buttons use the **highlight shade** as background with the **background shade** as text.
5. Error state: show a full-width pixel-art alert box with a `⚠` pixel icon and the message `SOMETHING WENT WRONG` in a red-tinted variant of the palette.
6. Preserve pixel-perfect alignment — no sub-pixel rendering.
