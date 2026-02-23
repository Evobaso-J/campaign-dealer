import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { AnthropicProvider } from "~~/server/services/ai/anthropic";
import type { AIProvider, AIRuntimeConfig } from "~~/server/services/ai/index";
import { OllamaProvider } from "~~/server/services/ai/ollama";
import { buildCharacterPrompt } from "~~/server/services/ai/prompts/character";
import { buildScriptPrompt } from "~~/server/services/ai/prompts/script";
import {
  generateRandomDistinctCharacters,
  type CharacterTemplate,
} from "~~/server/services/rpg/characterRandomizer";
import type { CharacterSheet } from "~~/shared/types/character";
import type { Genre } from "~~/shared/types/campaign";
import type { GeneratedText } from "~~/shared/types/utils";

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

const SETTING: Genre[] = ["cyberpunk", "cosmicHorror"];
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

function extractJson(raw: string): string {
  let text = raw;
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  if (fenced) text = fenced[1]!;
  // The prompt schema uses "undefined" for optional fields, which some
  // models emit literally. Replace bare `undefined` values with `null`
  // so JSON.parse succeeds.
  text = text.replace(/:\s*undefined\b/g, ": null");
  return text.trim();
}

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
        log(`    ${t.archetype} of ${t.suit}  |  ♥${t.modifiers.hearts} ♣${t.modifiers.clubs} ♠${t.modifiers.spades}`);
      }

      // Step 2: Generate character identities via AI
      log(`\n  Calling ${providerName} for character identities…`);
      characterSheets = [];
      for (const [i, template] of templates.entries()) {
        const label = `${template.archetype} of ${template.suit}`;
        const startMs = Date.now();
        const prompt = buildCharacterPrompt(template, SETTING);
        const result = await provider.complete(prompt);
        const identity = JSON.parse(extractJson(result.text));

        log(`    [${i + 1}/${templates.length}] ${label} → ${identity.name} (${elapsed(startMs)})`);

        characterSheets.push({
          archetype: template.archetype,
          suit: template.suit,
          damage: template.damage,
          modifiers: template.modifiers,
          suitSkill: template.suitSkill,
          archetypeSkills: template.archetypeSkills,
          characterIdentity: {
            name: identity.name as GeneratedText,
            pronouns: identity.pronouns as GeneratedText | undefined,
            concept: identity.concept as GeneratedText | undefined,
            weapon: identity.weapon
              ? {
                  name: identity.weapon.name as GeneratedText,
                  concealed: identity.weapon.concealed,
                }
              : undefined,
            instrument: identity.instrument
              ? {
                  name: identity.instrument.name as GeneratedText,
                  concealed: identity.instrument.concealed,
                }
              : undefined,
          },
        });
      }

      // Step 3: Generate GM script via AI
      log(`\n  Calling ${providerName} for GM script…`);
      const scriptStart = Date.now();
      const scriptPrompt = buildScriptPrompt(characterSheets, SETTING);
      const scriptResult = await provider.complete(scriptPrompt);
      gmScript = JSON.parse(extractJson(scriptResult.text));
      log(`    Done (${elapsed(scriptStart)})`);
      log(`    Hook: ${(gmScript.hook as string).slice(0, 80)}…`);
      log(`    Central tension: ${gmScript.centralTension}\n`);
    }, 180_000);

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

    it("GM script has all three targets", () => {
      const targets = gmScript.targets as Record<string, { name: string }>;
      expect(targets.king).toBeDefined();
      expect(targets.king!.name).toBeTruthy();
      expect(targets.queen).toBeDefined();
      expect(targets.queen!.name).toBeTruthy();
      expect(targets.jack).toBeDefined();
      expect(targets.jack!.name).toBeTruthy();
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
