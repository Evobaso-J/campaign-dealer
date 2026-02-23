import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AnthropicProvider } from "~~/server/services/ai/anthropic";
import type { AIProvider, AIRuntimeConfig } from "~~/server/services/ai/index";
import { OllamaProvider } from "~~/server/services/ai/ollama";
import { buildCharacterPrompt } from "~~/server/services/ai/prompts/character";
import { buildScriptPrompt } from "~~/server/services/ai/prompts/script";
import {
  generateRandomDistinctCharacters,
  type CharacterTemplate,
} from "~~/server/services/rpg/characterRandomizer";
import { parseAIJson } from "~~/server/utils/parseAIJson";
import type { CharacterSheet } from "~~/shared/types/character";
import { GenreGroups, type Genre } from "~~/shared/types/campaign";

/**
 * Smoke test — exercises the full campaign generation pipeline:
 *   1. Generate random character templates (pure logic)
 *   2. Call AI provider to create character identities for each template
 *   3. Call AI provider to generate a GM script for the party
 *
 * Run:  pnpm smoke
 * Requires:  .env with NUXT_AI_API_KEY set (or NUXT_AI_PROVIDER=ollama)
 */

// ── .env loader ────────────────────────────────────────────────────────

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

const SETTING: Genre[] = pickRandomSettings(2);
const CHARACTER_COUNT = 3;

function buildConfig(): { config: AIRuntimeConfig; providerName: string } {
  const dotenv = loadDotEnv();
  const providerName =
    process.env.NUXT_AI_PROVIDER || dotenv.NUXT_AI_PROVIDER || "anthropic";
  const apiKey = process.env.NUXT_AI_API_KEY || dotenv.NUXT_AI_API_KEY;
  const model = process.env.NUXT_AI_MODEL || dotenv.NUXT_AI_MODEL || undefined;
  const ollamaHost =
    process.env.NUXT_AI_OLLAMA_HOST || dotenv.NUXT_AI_OLLAMA_HOST || undefined;

  return {
    providerName,
    config: {
      provider: providerName as AIRuntimeConfig["provider"],
      apiKey: apiKey || "ollama",
      model,
      ollamaHost,
    },
  };
}

function createProvider(
  providerName: string,
  config: AIRuntimeConfig,
): AIProvider {
  if (providerName === "ollama") {
    return new OllamaProvider(config);
  }
  return new AnthropicProvider(config);
}

// ── Helpers ──────────────────────────────────────────────────────────

function elapsed(startMs: number): string {
  return ((Date.now() - startMs) / 1000).toFixed(1) + "s";
}

const log = console.log;

// ── Test suite ─────────────────────────────────────────────────────────

const { config, providerName } = buildConfig();
const hasCredentials =
  providerName === "ollama" || (config.apiKey && config.apiKey !== "ollama");

describe.skipIf(!hasCredentials)(
  "smoke test: full campaign generation pipeline",
  () => {
    const provider = createProvider(providerName, config);

    let templates: CharacterTemplate[];
    let characterSheets: CharacterSheet[];
    let gmScript: Record<string, unknown>;

    beforeAll(async () => {
      log(`\n  Provider: ${providerName}`);
      if (config.model) log(`  Model: ${config.model}`);

      // Step 1: Generate character templates
      log(`\n  Generating ${CHARACTER_COUNT} character templates…`);
      templates = generateRandomDistinctCharacters(CHARACTER_COUNT);
      for (const t of templates) {
        log(
          `    ${t.archetype} of ${t.suit}  |  ♥${t.modifiers.hearts} ♣${t.modifiers.clubs} ♠${t.modifiers.spades}`,
        );
      }

      // Step 2: Generate character identities via AI
      log(`\n  Calling ${providerName} for character identities…`);
      characterSheets = [];
      for (const [i, template] of templates.entries()) {
        const label = `${template.archetype} of ${template.suit}`;
        const startMs = Date.now();
        const prompt = buildCharacterPrompt(template, SETTING);
        const result = await provider.complete(prompt);
        const identity = parseAIJson<CharacterSheet["characterIdentity"]>(
          result.text,
        );

        log(
          `    [${i + 1}/${templates.length}] ${label} → ${identity.name} (${elapsed(startMs)})`,
        );

        characterSheets.push({
          archetype: template.archetype,
          suit: template.suit,
          damage: template.damage,
          modifiers: template.modifiers,
          suitSkill: template.suitSkill,
          archetypeSkills: template.archetypeSkills,
          characterIdentity: identity,
        });
      }

      // Step 3: Generate GM script via AI
      log(`\n  Calling ${providerName} for GM script…`);
      const scriptStart = Date.now();
      const scriptPrompt = buildScriptPrompt(characterSheets, SETTING);
      const scriptResult = await provider.complete(scriptPrompt);
      gmScript = parseAIJson<Record<string, unknown>>(scriptResult.text);
      log(`    Done (${elapsed(scriptStart)})`);
      log(`    Hook: ${(gmScript.hook as string).slice(0, 80)}…`);
      log(`    Central tension: ${gmScript.centralTension}\n`);
    }, 180_000);

    afterAll(() => {
      if (!characterSheets?.length || !gmScript) return;

      const lines: string[] = [];
      const divider = "═".repeat(72);
      const thinDivider = "─".repeat(72);
      const timestamp = new Date().toISOString();

      lines.push(divider);
      lines.push(`  SMOKE TEST — CAMPAIGN OUTPUT`);
      lines.push(`  ${timestamp}`);
      lines.push(
        `  Provider: ${providerName}${config.model ? ` | Model: ${config.model}` : ""}`,
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
          lines.push(`      Concept: ${id.concept}`);
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

      lines.push(`  Hook:`);
      lines.push(`    ${gmScript.hook}`);
      lines.push("");

      lines.push(`  Central Tension:`);
      lines.push(`    ${gmScript.centralTension}`);
      lines.push("");

      // Targets
      const targets = gmScript.targets as Record<
        string,
        { name: string; description?: string; fate?: string; notes?: string }
      >;
      lines.push(`  Targets:`);
      for (const role of ["king", "queen", "jack"] as const) {
        const t = targets[role];
        if (!t) continue;
        lines.push(`    ${role.toUpperCase()}: ${t.name}`);
        if (t.description) lines.push(`      Description: ${t.description}`);
        if (t.fate) lines.push(`      Fate: ${t.fate}`);
        if (t.notes) lines.push(`      Notes: ${t.notes}`);
      }
      lines.push("");

      // Weak Points
      const weakPoints = gmScript.weakPoints as {
        name: string;
        role: string;
      }[];
      lines.push(`  Weak Points (${weakPoints.length}):`);
      for (const [j, wp] of weakPoints.entries()) {
        lines.push(
          `    ${String(j + 1).padStart(2, " ")}. ${wp.name} — ${wp.role}`,
        );
      }
      lines.push("");

      // Scenes
      const scenes = gmScript.scenes as string[];
      lines.push(`  Scenes (${scenes.length}):`);
      for (const [j, scene] of scenes.entries()) {
        lines.push(`    ${String(j + 1).padStart(2, " ")}. ${scene}`);
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

    it("generates the correct number of distinct character templates", () => {
      expect(templates).toHaveLength(CHARACTER_COUNT);
      const keys = templates.map((t) => `${t.archetype}-${t.suit}`);
      expect(new Set(keys).size).toBe(CHARACTER_COUNT);
    });

    it("each template has required fields", () => {
      for (const t of templates) {
        expect(t.archetype).toBeDefined();
        expect(t.suit).toBeDefined();
        expect(t.modifiers).toBeDefined();
        expect(t.suitSkill).toBeDefined();
        expect(t.archetypeSkills.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("each character sheet has a valid AI-generated identity", () => {
      expect(characterSheets).toHaveLength(CHARACTER_COUNT);
      for (const sheet of characterSheets) {
        expect(sheet.characterIdentity.name).toBeTruthy();
      }
    });

    it("GM script has a hook", () => {
      expect(gmScript.hook).toBeTruthy();
    });

    it("GM script has all three targets with descriptions", () => {
      const targets = gmScript.targets as Record<
        string,
        { name: string; description: string }
      >;
      expect(targets.king).toBeDefined();
      expect(targets.king!.name).toBeTruthy();
      expect(targets.king!.description).toBeTruthy();
      expect(targets.queen).toBeDefined();
      expect(targets.queen!.name).toBeTruthy();
      expect(targets.queen!.description).toBeTruthy();
      expect(targets.jack).toBeDefined();
      expect(targets.jack!.name).toBeTruthy();
      expect(targets.jack!.description).toBeTruthy();
    });

    it("GM script has 10 weak points", () => {
      const weakPoints = gmScript.weakPoints as {
        name: string;
        role: string;
      }[];
      expect(weakPoints).toHaveLength(10);
      for (const wp of weakPoints) {
        expect(wp.name).toBeTruthy();
        expect(wp.role).toBeTruthy();
      }
    });

    it("GM script has scenes and central tension", () => {
      expect(gmScript.scenes).toBeDefined();
      expect((gmScript.scenes as string[]).length).toBeGreaterThanOrEqual(1);
      expect(gmScript.centralTension).toBeTruthy();
    });
  },
);
