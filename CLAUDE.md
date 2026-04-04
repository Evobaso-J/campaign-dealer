# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Brain

This project uses a **progressive-disclosure brain system** in `brain/`. Before starting a task, read `brain/AGENT.md` — it contains a routing table that tells you which module to load based on the task type. Module-level instruction files provide domain-specific behavioral rules. JSONL files in each module store past decisions, phase status, and task tracking as episodic memory.

```
brain/
├── AGENT.md                    ← Level 1: always read first (routing + decision table)
├── architecture/
│   ├── ARCHITECTURE.md         ← Level 2: layer contracts, dependency rules, scaling paths
│   └── decisions.jsonl         ← Level 3: cross-cutting architectural decisions
├── rpg/
│   ├── RPG.md                  ← Level 2: game mechanics, character generation
│   └── decisions.jsonl         ← Level 3: past RPG decisions
├── ai/
│   ├── AI.md                   ← Level 2: providers, prompts, model output
│   └── decisions.jsonl         ← Level 3: past AI decisions
├── frontend/
│   ├── FRONTEND.md             ← Level 2: components, styling, i18n
│   └── decisions.jsonl         ← Level 3: past UI decisions
├── planning/
│   ├── PLANNING.md             ← Level 2: component contracts, current phase context
│   ├── phases.jsonl            ← Level 3: phase status (done/in_progress/todo)
│   └── tasks.jsonl             ← Level 3: task-level status per phase
└── tooling/
    ├── TOOLING.md              ← Level 2: testing, CI, tooling
    ├── decisions.jsonl         ← Level 3: past tooling decisions
    └── failures.jsonl          ← Level 3: past failures and fixes
```

**Rules:** JSONL files are append-only. Never overwrite entries — mark outdated ones with `"status": "archived"`. New entry IDs use `{type}_{YYYYMMDD}_{HHMMSS}` format. Log significant decisions and failures as you work.
