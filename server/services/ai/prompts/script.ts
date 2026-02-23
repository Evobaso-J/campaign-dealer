import type { AIPrompt } from "~~/server/services/ai/index";
import type { CharacterSheet } from "~~/shared/types/character";

const SYSTEM_PROMPT = `You are a creative writing assistant for a tabletop RPG called "The House Doesn't Always Win."
Your task is to generate a Game Master script for a session-zero campaign introduction.

You MUST respond with ONLY a valid JSON object matching the GameMasterScript schema below.
Do not include any text, explanation, or markdown formatting outside of the JSON object.

GameMasterScript schema:
{
  "hook": string (required) — an opening narrative hook (2-4 sentences) that sets the scene and draws the players into the story,
  "weakPoints": [
    {
      "name": string (required) — the name of an antagonist Target or their associate,
      "role": string (required) — their role in the antagonist organization,
      "motive": string (required) — a secret motive or vulnerability the players can exploit
    }
  ] (required, exactly 10 items) — weak points in the antagonist organization that the players can discover and exploit,
  "scenes": string[] (required, 3-5 items) — key scenes or encounters for the session, each described in 2-3 sentences,
  "centralTension": string (required) — a one-sentence description of the core conflict driving the campaign
}

Guidelines:
- The hook should reference the campaign setting and hint at the central tension.
- Each weak point must be a distinct character with a unique role and exploitable motive.
- The scenes should form a natural narrative progression from introduction to rising action.
- The central tension should tie together the player characters, the setting, and the antagonist targets.
- Tailor all content to the specific player characters and campaign setting provided.`;

export function buildScriptPrompt(
  characters: CharacterSheet[],
  setting: string,
): AIPrompt {
  const characterSummaries = characters
    .map((c, i) => {
      const identity = c.characterIdentity;
      return `Character ${i + 1}:
  Name: ${identity.name}
  Archetype: ${c.archetype}
  Suit: ${c.suit}
  Concept: ${identity.concept ?? "N/A"}`;
    })
    .join("\n\n");

  const user = `Generate a GameMasterScript for a session-zero campaign with the following party and setting.

Party:
${characterSummaries}

Campaign setting: ${setting}`;

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
