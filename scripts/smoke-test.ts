/**
 * Standalone smoke-test script — exercises the full Phase 3 pipeline:
 *   1. Generate 3 random character templates (pure logic)
 *   2. Call Claude to create character identities for each template
 *   3. Call Claude to generate a GM script for the party
 *
 * Run:  pnpm smoke
 * Requires:  .env with NUXT_AI_API_KEY set
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { AnthropicProvider } from "../server/services/ai/anthropic";
import type { AIProvider, AIRuntimeConfig } from "../server/services/ai/index";
import { OllamaProvider } from "../server/services/ai/ollama";
import { buildCharacterPrompt } from "../server/services/ai/prompts/character";
import { buildScriptPrompt } from "../server/services/ai/prompts/script";
import { generateRandomDistinctCharacters } from "../server/services/rpg/characterRandomizer";
import type { CharacterSheet } from "../shared/types/character";
import type { Genre } from "../shared/types/campaign";
import type { GeneratedText } from "../shared/types/utils";

// ── Configuration ──────────────────────────────────────────────────────

const SETTING: Genre[] = ["cyberpunk", "cosmicHorror"];
const CHARACTER_COUNT = 3;

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
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      envVars[key] = value;
    }
  } catch {
    // .env not found — rely on existing process.env
  }
  return envVars;
}

// ── Helpers ────────────────────────────────────────────────────────────

const separator = () => console.log("\n" + "═".repeat(72) + "\n");

function elapsed(startMs: number): string {
  return ((Date.now() - startMs) / 1000).toFixed(1) + "s";
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🎲 Campaign Dealer — Phase 3 Smoke Test");
  console.log(`   Setting: ${SETTING.join(", ")}`);
  console.log(`   Characters: ${CHARACTER_COUNT}`);
  separator();

  // 1. Resolve config
  const dotenv = loadDotEnv();
  const providerName =
    process.env.NUXT_AI_PROVIDER || dotenv.NUXT_AI_PROVIDER || "anthropic";
  const apiKey = process.env.NUXT_AI_API_KEY || dotenv.NUXT_AI_API_KEY;
  const model = process.env.NUXT_AI_MODEL || dotenv.NUXT_AI_MODEL || undefined;

  if (providerName !== "ollama" && !apiKey) {
    console.error(
      "❌ NUXT_AI_API_KEY is not set. Add it to .env or export it in your shell.",
    );
    process.exit(1);
  }
  console.log(`✓ Provider: ${providerName}`);
  if (apiKey && providerName !== "ollama")
    console.log(`✓ API key loaded (${apiKey.slice(0, 8)}…)`);
  if (model) console.log(`✓ Model override: ${model}`);

  // 2. Create provider
  const config: AIRuntimeConfig = {
    provider: providerName as AIRuntimeConfig["provider"],
    apiKey: apiKey || "ollama",
    model,
  };
  let provider: AIProvider;
  if (providerName === "ollama") {
    provider = new OllamaProvider(config);
    console.log("✓ OllamaProvider instantiated");
  } else {
    provider = new AnthropicProvider(config);
    console.log("✓ AnthropicProvider instantiated");
  }
  separator();

  // 3. Generate character templates
  console.log("⚙ Generating character templates…");
  const templates = generateRandomDistinctCharacters(CHARACTER_COUNT);
  for (const [i, t] of templates.entries()) {
    console.log(`\n  Character ${i + 1}: ${t.archetype} of ${t.suit}`);
    console.log(
      `    Modifiers: ♥ ${t.modifiers.hearts}  ♣ ${t.modifiers.clubs}  ♠ ${t.modifiers.spades}`,
    );
    console.log(`    Suit skill: ${t.suitSkill.name}`);
    console.log(
      `    Archetype skills: ${t.archetypeSkills.map((s: { name: string }) => s.name).join(", ")}`,
    );
  }
  separator();

  // 4. Generate character identities via AI
  console.log(`🤖 Calling ${providerName} for character identities…\n`);
  const characterSheets: CharacterSheet[] = [];

  for (const [i, template] of templates.entries()) {
    const label = `[${i + 1}/${templates.length}] ${template.archetype} of ${template.suit}`;
    process.stdout.write(`  ${label} … `);

    const prompt = buildCharacterPrompt(template, SETTING);
    const startMs = Date.now();
    const result = await provider.complete(prompt);

    let identity;
    try {
      identity = JSON.parse(result.text);
    } catch {
      console.error(`\n❌ Failed to parse AI response for ${label}:`);
      console.error(result.text);
      process.exit(1);
    }
    console.log(`done (${elapsed(startMs)})`);

    // Merge template + identity → CharacterSheet
    const sheet: CharacterSheet = {
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
    };
    characterSheets.push(sheet);

    // Print identity
    const id = sheet.characterIdentity;
    console.log(`    Name:       ${id.name}`);
    if (id.pronouns) console.log(`    Pronouns:   ${id.pronouns}`);
    if (id.concept) console.log(`    Concept:    ${id.concept}`);
    if (id.weapon)
      console.log(
        `    Weapon:     ${id.weapon.name} (concealed: ${id.weapon.concealed})`,
      );
    if (id.instrument)
      console.log(
        `    Instrument: ${id.instrument.name} (concealed: ${id.instrument.concealed})`,
      );
    console.log();
  }

  separator();

  // 5. Generate GM script via AI
  console.log(`🤖 Calling ${providerName} for GM script…\n`);
  const scriptPrompt = buildScriptPrompt(characterSheets, SETTING);
  const scriptStart = Date.now();
  const scriptResult = await provider.complete(scriptPrompt);

  let gmScript;
  try {
    gmScript = JSON.parse(scriptResult.text);
  } catch {
    console.error("❌ Failed to parse GM script response:");
    console.error(scriptResult.text);
    process.exit(1);
  }
  console.log(`  Done (${elapsed(scriptStart)})\n`);

  // Print GM script
  console.log("📜 HOOK");
  console.log(`  ${gmScript.hook}\n`);

  console.log("🎯 TARGETS");
  for (const [role, target] of Object.entries(gmScript.targets) as [
    string,
    { name: string },
  ][]) {
    console.log(`  ${role.toUpperCase()}: ${target.name}`);
  }

  console.log("\n🔓 WEAK POINTS");
  for (const wp of gmScript.weakPoints) {
    console.log(`  • ${wp.name} — ${wp.role}`);
  }

  console.log("\n🎬 SCENES");
  for (const [i, scene] of gmScript.scenes.entries()) {
    console.log(`  Session ${i + 1}: ${scene}`);
  }

  console.log(`\n⚡ CENTRAL TENSION`);
  console.log(`  ${gmScript.centralTension}`);

  separator();
  console.log("✅ Smoke test complete.");
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err);
  process.exit(1);
});
