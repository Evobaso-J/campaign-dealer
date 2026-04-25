# AGENTS.md

<!-- exodia:section:overview -->
**Campaign Dealer** is a Nuxt 4 full-stack app that generates tabletop RPG campaigns ("The House Doesn't Always Win", a card-suit-based system) using AI. Players pick `archetype × suit` combos; the server runs a deterministic randomizer for mechanics, then calls a configurable AI provider (Anthropic / Gemini / OpenAI / Ollama) to produce in-setting character identities and a Game Master script. Visual identity: Game Boy 1-bit pixel art with genre-driven 4-shade palettes.

## Commands

<!-- exodia:section:commands -->
Check `package.json` for the full script inventory. **Do not run lint, test, or typecheck unless explicitly asked.** CI and pre-commit hooks own these gates. Detected commands in this repo: `pnpm lint`, `pnpm typecheck`, `pnpm test` (`--project unit | nuxt | server`). Package manager: `pnpm` (locked via `packageManager`); never use `npm`.

## Context Router

<!-- exodia:section:router -->
Route by task type. Read the relevant L2 module, then load L3 data (`.jsonl` / `.yaml`) only when needed. **Max 2 hops.**

| Task type | Load |
| --------- | ---- |
| Layer contracts, dependency direction, scaling paths | `context/architecture/ARCHITECTURE.md` |
| Game entities, types, business language | `context/domain/DOMAIN.md` |
| Character generation, archetypes, suits, randomizer | `context/rpg/RPG.md` |
| AI providers, prompts, JSON parsing, model output | `context/ai/AI.md` |
| Vue components, Tailwind v4, i18n, Pinia, palette | `context/frontend/FRONTEND.md` |
| Roadmap, phase status, component contracts | `context/planning/PLANNING.md` (+ `phases.jsonl` / `tasks.jsonl`) |
| Env vars, dev environment, test infra, CI | `context/operations/OPERATIONS.md` |
| Bugs, footguns, fix recipes | `context/debugging/DEBUGGING.md` |

## Behavioral Rules

<!-- exodia:section:rules -->
1. **Route first.** Use the Context Router table above before loading any data file. Do not guess; the router exists to avoid guessing.
2. **Load lazily.** Never load all L3 files at once. Max 2 hops: router → L2 narrative → (optional) L3 data. If the task is answerable from L2 alone, stop there.
3. **Append only.** `.jsonl` data files are append-only. When an entry becomes obsolete, mark it `archived`; do not delete.
4. **Rationale required.** ADRs and decisions must include *why*. An entry without a reason will rot.
5. **Read before write.** Before appending to a data file, scan it for a duplicate or near-duplicate. Update or supersede rather than create a duplicate.
6. **IDs are timestamps.** All L3 entries use the format `{type}_{YYYYMMDD}_{HHMMSS}_{4hex}` where `{type}` is the target file's `_schema` value (first line of the `.jsonl`). Sortable, collision-free.
7. **Context update as final task.** When planning work with a todo list, always add a final step: "Evaluate context update." Walk the §Self-Update Rules table below and decide if any entry should be captured. If nothing qualifies, skip. Do not create entries just to fill the step.
8. **Operations awareness.** Check `context/operations/OPERATIONS.md` before touching env vars, build config, or anything that differs between environments. When in doubt, open the file.
9. **Layer boundaries are sacred.** `app/` never imports from `server/`; `app/` never calls AI directly. `shared/types/` is the only legal cross-layer surface.
10. **i18n from day one.** All user-facing text uses i18n keys. Update `en.json` and `it.json` together. Natural case in locale files; CSS `text-transform` for visual uppercase.
11. **Game data is copyright-protected.** `server/data/houseDoesntWin/characterTemplates.ts` is git-ignored on public clones. Never commit rulebook text publicly.

## Self-Update Rules

<!-- exodia:section:self-update -->
The context files are **shared, living documentation** about the codebase, not personal memory. After completing a task, check whether any codebase fact, decision, or pattern (discovered or taught) should be logged for future sessions. Write in objective, third-person terms (the team decided X because Y), not first-person recollection (I learned X). **Do not ask the user for permission; just do it.** The user can always revert via git.

### When to update

All target-file paths below are relative to the context directory (`context/`).

| Signal during conversation | Target file | What to write |
| -------------------------- | ----------- | ------------- |
| Codebase assumption corrected by user or by evidence | L2 `.md` file for that area | Update the incorrect section |
| Bug pattern identified with non-obvious root cause | `debugging/playbooks.jsonl` | New playbook entry |
| Pitfall or footgun confirmed ("don't do X" / "watch out for Y") | `debugging/gotchas.jsonl` | New gotcha entry |
| Cross-cutting architecture or layer-contract decision | `architecture/decisions.jsonl` | New ADR entry |
| RPG / game-mechanics decision | `rpg/decisions.jsonl` | New ADR entry |
| AI provider, prompt, or output-handling decision | `ai/decisions.jsonl` | New ADR entry |
| UI / styling / palette / wizard decision | `frontend/decisions.jsonl` | New ADR entry |
| Tooling / test / dev-env decision | `operations/decisions.jsonl` | New ADR entry |
| Variant-specific behavior confirmed | `operations/variants.yaml` | New entry under the relevant variant |
| Domain term clarified or new entity appears | `domain/glossary.yaml` | New or updated term |
| Phase advances (start, finish, scope change) | `planning/phases.jsonl` | Append a new entry; do not edit the original |
| Task progress within a phase | `planning/tasks.jsonl` | Append a new entry per state change |
| Planning-level decision (wizard structure, phase boundary) | `planning/decisions.jsonl` | New ADR entry |

### How to update

1. **Read the target file first**: check for duplicates or entries that should be updated instead of duplicated.
2. **Branch-scoped dedup.** Check the current branch (`git branch --show-current`). If an entry on the same topic was added on the **current branch** (check with `git diff <default-branch> -- <file>`), **replace it in-place** instead of appending. A branch is a unit of work; it should produce one entry per topic, not one per iteration or conversation. Once an entry is merged, it is settled and should not be overwritten; only superseded by a new entry on a new branch if the understanding changes.
3. **Use the existing schema**: every `.jsonl` file starts with a `_schema` line (JSON object with `_schema`, `_version`, `_description`, `_fields`). Read `_fields` to know which keys an entry must carry. Match field names exactly. Do not invent fields. If the schema must evolve, bump `_version` in the first line before adding entries with the new shape.
4. **Generate the ID**: format `{type}_{YYYYMMDD}_{HHMMSS}_{4hex}` using the current date/time. When replacing an entry per rule 2, keep the original ID.
5. **Append, don't rewrite**: add new lines at the end of `.jsonl` files. For `.md` and `.yaml` files, edit the relevant section. Exception: see rule 2; entries added on the current branch are mutable until merged.
6. **Archive, don't delete.** When a `.jsonl` entry becomes obsolete (gotcha no longer applies, runbook replaced, experiment failed), set `status: archived` on the entry instead of removing the line. Preserves history for retrospectives. The `status` field is part of every appendable schema's `_fields` (ADR schemas use `status: superseded` for the same purpose, with `supersedes: <id>` pointing at the replacement).
7. **Keep entries atomic**: one insight per entry. Don't bundle multiple gotchas into one.
8. **Be concise**: write for a developer who will read this months later without the conversation context.
9. **Point, don't hardcode**: never copy values that already live in source files (versions, ports, config). Reference the file instead.

### What NOT to capture

- Anything already in the context files (check first).
- Ephemeral debugging steps that only apply to this session.
- User preferences about agent behavior (those belong in `.claude/` or equivalent settings, not here).
- Information that can be derived from reading the code or git history.

### What NOT to capture (codebase-specific)

These rot fast; pointer only, never hardcode:

- Dependency versions, ports, env-var values, API endpoints, hostnames: reference the source file (`see package.json`, `defined in .env.example`).
- Function signatures, type definitions, class hierarchies, DB schemas: derivable by reading code.
- Git-derivable facts (commit author, date, PR number, blame line): use `git log` / `git blame`.
- Patterns already obvious from `package.json` / lockfile dependencies ("we use Pinia" when `pinia` is in deps).
- Test names, file counts, directory listings: rerun the command.
- One-session workarounds that will be gone next branch, unless the fix teaches a durable rule.

### When adding a new L3 file

If a recurring signal does not fit any target file in the table above, a new L3 file may be justified. Pick its format from the **File Format Strategy** table below. Add a row to the signal-target table at the same time so future sessions route to it.

### File Format Strategy

| Format | Use when the data is | Examples |
| ------ | -------------------- | -------- |
| `.jsonl` | Append-only list of dated records, OR id-keyed record list mutated by id-rewrite. One self-contained record per line. | decisions, gotchas, playbooks, phases, tasks |
| `.yaml` | Named, structured tree describing the *shape* of something stable. Mutated by editing nodes in place. | glossary, variants |
| `.md` | Long-form narrative: prose read top to bottom. The L2 module file is always `.md`; additional `.md` files at L3 are rare. | walkthroughs |

If two formats fit, prefer `.jsonl`; agents handle line-delimited records more reliably than nested YAML, and append-only is safer for long-running context. JSONL files always start with a single-line schema header: `{"_schema": "<type>", "_version": "1.0", "_description": "...", "_fields": [...]}`.

## Quick Action Table

<!-- exodia:section:quick-actions -->
| Developer says | Action sequence |
| -------------- | --------------- |
| "Add a new character skill / archetype / suit" | Read `context/rpg/RPG.md` → check `server/data/houseDoesntWin/` → update types in `shared/types/` |
| "Add a new AI provider" | Read `context/ai/AI.md` → create `server/services/ai/<name>.ts` → call `registerProvider()` |
| "Change a prompt / improve AI output" | Read `context/ai/AI.md` → edit `server/services/ai/prompts/` → test with `--project server` |
| "Add / modify a UI component" | Read `context/frontend/FRONTEND.md` → check design tokens in `app/assets/css/` → use i18n keys, prefer Nuxt UI |
| "What's the overall architecture?" | Read `context/architecture/ARCHITECTURE.md` → identify the relevant layer |
| "What phase are we on / what's done?" | Read `context/planning/phases.jsonl` → check status fields |
| "What are the component contracts for X?" | Read `context/planning/PLANNING.md` → find component in contracts table |
| "Fix a bug in character generation" | Read `context/rpg/RPG.md` + `context/ai/AI.md` → check randomizer + prompt → write regression test |
| "Add i18n strings" | Read `context/frontend/FRONTEND.md` → add to both `en.json` and `it.json` → natural case, CSS for uppercase |
| "Write / fix a test" | Read `context/operations/OPERATIONS.md` → identify vitest project (unit / nuxt / server) → run targeted |
| "Add a new API endpoint" | Read `context/ai/AI.md` → add Zod schema in `server/utils/validate.ts` → follow existing endpoint patterns |
| "Change the theme / palette" | Read `context/frontend/FRONTEND.md` → edit `@theme` block (Tailwind v4) → respect 4-shade palette system |
| "Refactor / restructure code" | Read `context/architecture/ARCHITECTURE.md` + relevant module decisions → preserve layer boundaries |

## Context Structure

<!-- exodia:section:structure -->

```text
context/
├── architecture/
│   ├── ARCHITECTURE.md
│   └── decisions.jsonl
├── domain/
│   ├── DOMAIN.md
│   └── glossary.yaml
├── rpg/
│   ├── RPG.md
│   └── decisions.jsonl
├── ai/
│   ├── AI.md
│   └── decisions.jsonl
├── frontend/
│   ├── FRONTEND.md
│   └── decisions.jsonl
├── planning/
│   ├── PLANNING.md
│   ├── decisions.jsonl
│   ├── phases.jsonl
│   └── tasks.jsonl
├── operations/
│   ├── OPERATIONS.md
│   ├── decisions.jsonl
│   └── variants.yaml
└── debugging/
    ├── DEBUGGING.md
    ├── gotchas.jsonl
    └── playbooks.jsonl
```
