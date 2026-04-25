# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Context

Project context lives in **`AGENTS.md`** at the repo root, with per-module narrative + data under `context/`. The layout: an `AGENTS.md` router table at L1, a single L2 narrative file per module (`context/<module>/<MODULE>.md`), and append-only L3 data ledgers (`.jsonl` / `.yaml`) in the same directory.

**Read `AGENTS.md` first.** Its Context Router maps task types to the L2 module to load; its Self-Update Rules describe when and how to write back. Max 2 hops to any piece of information.

## Conventions

- **Append only.** `.jsonl` files are append-only — mark obsolete entries `"status": "archived"`, never delete or rewrite.
- **ID format.** New L3 entries use `{type}_{YYYYMMDD}_{HHMMSS}_{4hex}` where `{type}` is the file's `_schema` value (first line).
- **Self-update.** Log decisions, gotchas, and playbooks as you work — see `AGENTS.md` § Self-Update Rules for the signal-to-target mapping.
