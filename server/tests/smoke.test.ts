import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  GenreGroups,
  type GameMasterScript,
  type Locale,
  type Genre,
} from "~~/shared/types/campaign";
import type { CharacterSheet } from "~~/shared/types/character";
import { generateCharacterTemplate } from "~~/shared/utils/characterRandomizer";

/**
 * E2E smoke test — exercises the full campaign generation pipeline via HTTP:
 *   1. Starts a real Nuxt server
 *   2. POST /api/campaign/characters → CharacterSheet[]
 *   3. POST /api/campaign/script    → GameMasterScript
 *
 * Run:  pnpm smoke
 * Requires:  .env with NUXT_AI_API_KEY set (or NUXT_AI_PROVIDER=ollama)
 */

// ── .env loader (only used for the skip-check & report header) ─────────

function loadDotEnv(): Record<string, string> {
  const envVars: Record<string, string> = {};
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      envVars[trimmed.slice(0, eqIndex).trim()] = trimmed
        .slice(eqIndex + 1)
        .trim();
    }
  } catch {
    // .env not found — rely on existing process.env
  }
  return envVars;
}

// ── Configuration ──────────────────────────────────────────────────────

const ALL_GENRES: Genre[] = Object.values(GenreGroups).flat() as Genre[];

function pickRandomSettings(count: number): Genre[] {
  const shuffled = [...ALL_GENRES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const dotenv = loadDotEnv();
const providerName =
  process.env.NUXT_AI_PROVIDER || dotenv.NUXT_AI_PROVIDER || "anthropic";
const modelName =
  process.env.NUXT_AI_MODEL || dotenv.NUXT_AI_MODEL || undefined;
const apiKey = process.env.NUXT_AI_API_KEY || dotenv.NUXT_AI_API_KEY;

const SETTING: Genre[] = pickRandomSettings(2);
const TEMPLATES = [
  generateCharacterTemplate("king", "hearts"),
  generateCharacterTemplate("queen", "clubs"),
  generateCharacterTemplate("jack", "spades"),
];
const LANGUAGE: Locale = "en" as const;

const hasCredentials =
  providerName === "ollama" || (apiKey && apiKey !== "ollama");

// ── Helpers ──────────────────────────────────────────────────────────

function wrapText(text: string, lineWidth: number, indent: string): string {
  const words = String(text).split(" ");
  const lines: string[] = [];
  let current = indent;
  for (const word of words) {
    if (current === indent) {
      current += word;
    } else if (current.length + 1 + word.length <= lineWidth) {
      current += " " + word;
    } else {
      lines.push(current);
      current = indent + word;
    }
  }
  if (current !== indent) lines.push(current);
  return lines.join("\n");
}

const log = console.log;

// ── Test suite ─────────────────────────────────────────────────────────

describe.skipIf(!hasCredentials)(
  "e2e: full campaign generation pipeline",
  async () => {
    let characterSheets: CharacterSheet[];
    let gmScript: GameMasterScript;

    // Start a real Nuxt server.
    // In production mode, Nuxt doesn't load .env — we forward the
    // vars we already read so the server's runtimeConfig is populated.
    await setup({
      env: {
        ...dotenv,
        ...Object.fromEntries(
          Object.entries(process.env).filter(([k]) =>
            k.startsWith("NUXT_"),
          ) as [string, string][],
        ),
      },
    });

    beforeAll(async () => {
      log(`\n  Provider: ${providerName}`);
      if (modelName) log(`  Model: ${modelName}`);
      log(`  Setting: ${SETTING.join(", ")}`);

      // Step 1: Generate characters via API
      log(`\n  POST /api/campaign/characters (${TEMPLATES.length} templates)…`);
      const charStart = Date.now();
      characterSheets = await $fetch("/api/campaign/characters", {
        method: "POST",
        body: {
          templates: TEMPLATES,
          setting: SETTING,
          language: LANGUAGE,
        },
      });
      const charElapsed = ((Date.now() - charStart) / 1000).toFixed(1);
      log(
        `    ✓ Received ${characterSheets.length} characters (${charElapsed}s)`,
      );
      for (const sheet of characterSheets) {
        log(
          `      ${sheet.archetype} of ${sheet.suit} → ${sheet.characterIdentity.name}`,
        );
      }

      // Step 2: Generate GM script via API
      log(`\n  POST /api/campaign/script…`);
      const scriptStart = Date.now();
      gmScript = await $fetch("/api/campaign/script", {
        method: "POST",
        body: {
          characters: characterSheets,
          setting: SETTING,
          language: LANGUAGE,
        },
      });
      const scriptElapsed = ((Date.now() - scriptStart) / 1000).toFixed(1);
      log(`    ✓ Done (${scriptElapsed}s)`);
      log(`    Introduction: ${String(gmScript.introduction).slice(0, 80)}…`);
    }, 300_000);

    afterAll(() => {
      if (!characterSheets?.length || !gmScript) return;

      const lines: string[] = [];
      const divider = "═".repeat(72);
      const thinDivider = "─".repeat(72);
      const timestamp = new Date().toISOString();

      lines.push(divider);
      lines.push(`  E2E SMOKE TEST — CAMPAIGN OUTPUT`);
      lines.push(`  ${timestamp}`);
      lines.push(
        `  Provider: ${providerName}${modelName ? ` | Model: ${modelName}` : ""}`,
      );
      lines.push(`  Setting: ${SETTING.join(", ")}`);
      lines.push(divider);
      lines.push("");

      // ── Characters ──
      lines.push("▌ CHARACTERS");
      lines.push(thinDivider);
      for (const [i, sheet] of characterSheets.entries()) {
        const id = sheet.characterIdentity;
        lines.push(``);
        lines.push(`  [${i + 1}] ${id.name}`);
        if (id.pronouns) lines.push(`      Pronouns: ${id.pronouns}`);
        lines.push(
          `      Archetype: ${sheet.archetype}  |  Suit: ${sheet.suit}`,
        );
        lines.push(
          `      Modifiers: ♥${sheet.modifiers.hearts} ♣${sheet.modifiers.clubs} ♠${sheet.modifiers.spades}`,
        );
        if (id.concept) {
          lines.push(`      Concept:`);
          lines.push(wrapText(id.concept, 72, "        "));
        }
        if (id.weapon) {
          lines.push(
            `      Weapon: ${id.weapon.name}${id.weapon.concealed ? " (concealed)" : ""}`,
          );
        }
        if (id.instrument) {
          lines.push(
            `      Instrument: ${id.instrument.name}${id.instrument.concealed ? " (concealed)" : ""}`,
          );
        }
        lines.push(`      Suit Skill: ${sheet.suitSkill.name}`);
        lines.push(
          `      Archetype Skills: ${sheet.archetypeSkills.map((s) => s.name).join(", ")}`,
        );
      }

      lines.push("");
      lines.push("");

      // ── GM Script ──
      lines.push("▌ GM SCRIPT");
      lines.push(thinDivider);
      lines.push("");

      lines.push(`  Introduction:`);
      lines.push(wrapText(gmScript.introduction as string, 72, "    "));
      lines.push("");

      lines.push(`  Weapons: ${(gmScript.weapons as string[]).join(", ")}`);
      lines.push(
        `  Instruments: ${(gmScript.instruments as string[]).join(", ")}`,
      );
      lines.push("");

      // Targets
      const targets = gmScript.targets;
      lines.push(`  Targets:`);
      for (const role of ["king", "queen", "jack"] as const) {
        const t = targets[role];
        if (!t) continue;
        lines.push(`    ${role.toUpperCase()}: ${t.name}`);
        if (t.description) {
          lines.push(`      Description:`);
          lines.push(wrapText(t.description, 72, "        "));
        }
        if (t.locations) {
          lines.push(`      Locations:`);
          lines.push(wrapText(t.locations, 72, "        "));
        }
        if (t.defenses) {
          lines.push(`      Defenses:`);
          lines.push(wrapText(t.defenses, 72, "        "));
        }
        if (t.fate) {
          lines.push(`      Fate:`);
          lines.push(wrapText(t.fate, 72, "        "));
        }
        if (t.notes) {
          lines.push(`      Notes:`);
          lines.push(wrapText(t.notes, 72, "        "));
        }
      }
      lines.push("");

      // Rumors
      const rumors = gmScript.rumors;
      lines.push(`  Rumors (${rumors.length}):`);
      for (const [j, rumor] of rumors.entries()) {
        const prefix = `    ${String(j + 1).padStart(2, " ")}. `;
        const continuation = " ".repeat(prefix.length);
        const wrapped = wrapText(rumor, 72, continuation);
        lines.push(prefix + wrapped.slice(continuation.length));
      }

      // Content Warnings
      if (gmScript.contentWarnings?.length) {
        lines.push("");
        lines.push(
          `  Content Warnings: ${(gmScript.contentWarnings as string[]).join(", ")}`,
        );
      }

      lines.push("");
      lines.push(divider);

      const outputDir = resolve(process.cwd(), "server/tests/smoke-output");
      mkdirSync(outputDir, { recursive: true });
      const filename = `smoke-${timestamp.replace(/[:.]/g, "-")}.txt`;
      const outputPath = resolve(outputDir, filename);
      writeFileSync(outputPath, lines.join("\n"), "utf-8");
      log(`\n  📄 Output written to ${outputPath}\n`);
    });

    it("returns the correct number of character sheets", () => {
      expect(characterSheets).toHaveLength(TEMPLATES.length);
    });

    it("each character sheet has required fields and a valid identity", () => {
      for (const sheet of characterSheets) {
        expect(sheet.archetype).toBeDefined();
        expect(sheet.suit).toBeDefined();
        expect(sheet.modifiers).toBeDefined();
        expect(sheet.suitSkill).toBeDefined();
        expect(sheet.archetypeSkills.length).toBeGreaterThanOrEqual(1);
        expect(sheet.characterIdentity.name).toBeTruthy();
      }
    });

    it("character sheets are distinct (unique archetype-suit combos)", () => {
      const keys = characterSheets.map((s) => `${s.archetype}-${s.suit}`);
      expect(new Set(keys).size).toBe(TEMPLATES.length);
    });

    it("GM script has an introduction", () => {
      expect(gmScript.introduction).toBeTruthy();
    });

    it("GM script has weapons and instruments", () => {
      expect(gmScript.weapons.length).toBeGreaterThanOrEqual(1);
      expect(gmScript.instruments.length).toBeGreaterThanOrEqual(1);
    });

    it("GM script has all three targets with descriptions", () => {
      const targets = gmScript.targets;
      expect(targets.king).toBeDefined();
      expect(targets.king.name).toBeTruthy();
      expect(targets.king.description).toBeTruthy();
      expect(targets.queen).toBeDefined();
      expect(targets.queen.name).toBeTruthy();
      expect(targets.queen.description).toBeTruthy();
      expect(targets.jack).toBeDefined();
      expect(targets.jack.name).toBeTruthy();
      expect(targets.jack.description).toBeTruthy();
    });

    it("GM script has all three targets with locations and defenses", () => {
      for (const role of ["king", "queen", "jack"] as const) {
        const t = gmScript.targets[role];
        expect(t.locations).toBeTruthy();
        expect(t.defenses).toBeTruthy();
      }
    });

    it("GM script has rumors", () => {
      expect(gmScript.rumors.length).toBeGreaterThanOrEqual(1);
      for (const rumor of gmScript.rumors) {
        expect(rumor).toBeTruthy();
      }
    });
  },
);
