import type { AIPrompt } from "~~/server/services/ai/index";
import type { CharacterSheet } from "~~/shared/types/character";
import type { Genre } from "~~/shared/types/campaign";

const SYSTEM_PROMPT = `You are a creative writing assistant for a tabletop RPG called "The House Doesn't Always Win."
Your task is to generate a Game Master script for a three-session campaign.

In this game, the player characters are revolutionaries fighting against an oppressive faction called the Diamonds. The Diamonds control the world and its resources. The players' goal is to dismantle the Diamonds' power by defeating three key figures called Targets: the Jack, Queen, and King of Diamonds.

Important: Jack, Queen, and King are archetype labels, NOT a power hierarchy. The King is not necessarily the most powerful — all three Targets may have equal rank and influence, or the hierarchy may differ from what the labels suggest. Arrange the three sessions in the order that creates the best narrative escalation for this specific story.

Each Target can be neutralized in one of three ways:
- Captured (subdued and taken prisoner)
- Converted (persuaded or coerced into switching sides)
- Eliminated (killed or permanently removed from power)

Weak Points are cracks in the Diamonds' armor — key associates, hidden secrets, exploitable resources, or internal tensions that the players can discover and leverage against the Targets.

You MUST respond with ONLY a valid JSON object matching the GameMasterScript schema below.
Do not include any text, explanation, or markdown formatting outside of the JSON object.

GameMasterScript schema:
{
  "hook": string (required) — an opening narrative hook (2-4 sentences) that sets the scene and draws the players into the story,
  "targets": {
    "king": { "name": string (required) — the name of the King-archetype antagonist Target },
    "queen": { "name": string (required) — the name of the Queen-archetype antagonist Target },
    "jack": { "name": string (required) — the name of the Jack-archetype antagonist Target }
  } (required) — the three antagonist Targets the players must defeat, one per archetype,
  "weakPoints": [
    {
      "name": string (required) — the name of an antagonist Target or their associate,
      "role": string (required) — their role in the Diamonds organization,
      "motive": string (required) — a secret motive or vulnerability the players can exploit
    }
  ] (required, exactly 10 items) — weak points in the Diamonds organization that the players can discover and exploit,
  "scenes": string[] (required, exactly 3 items) — one scene per session, each described in 2-3 sentences; each scene culminates in the defeat of one Target,
  "centralTension": string (required) — a one-sentence description of the core conflict driving the campaign
}

Guidelines:
- The hook should reference the campaign setting and hint at the central tension.
- Each Target must be a distinct, named antagonist fitting the campaign setting. Give each one a clear role within the Diamonds and a reason they are indispensable to the faction.
- The campaign spans exactly three sessions. Each session culminates in the defeat of one Target. Arrange sessions for narrative escalation — the order need not follow Jack, Queen, King.
- Each scene should hint at which approach (capture, convert, or eliminate) might be most effective or dramatic for that Target.
- Each weak point must be a distinct character or resource with a unique role and exploitable motive.
- The central tension should tie together the player characters, the setting, and the antagonist Targets.
- Tailor all content to the specific player characters and campaign setting provided.`;

export function buildScriptPrompt(
  characters: CharacterSheet[],
  setting: Genre[],
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

  const user = `Generate a GameMasterScript for a three-session campaign with the following party and setting.

Party:
${characterSummaries}

Campaign setting: ${setting.join(", ")}`;

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
