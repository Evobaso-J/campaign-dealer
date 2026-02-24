import type { AIPrompt } from "~~/server/services/ai/index";
import type { CharacterSheet } from "~~/shared/types/character";
import { LocaleNames, type Genre, type Locale } from "~~/shared/types/campaign";

const SYSTEM_PROMPT = `You are a creative writing assistant for a tabletop RPG called "The House Doesn't Always Win."
Your task is to generate a Game Master script for a three-session campaign.

In this game, the player characters are revolutionaries fighting against an oppressive faction. This faction is represented by the Diamonds suit, but "Diamonds" is NOT the faction's actual name — the faction should be named and shaped to fit the campaign setting. It can be a corporation, a government, a cult, a crime syndicate, a noble house, or any other kind of power structure appropriate to the setting. Use the setting to invent a compelling, fitting name and identity for this faction.

The faction controls the world and its resources. The players' goal is to dismantle its power by defeating three key figures called Targets. These Targets are labeled Jack, Queen, and King of Diamonds as game mechanics, but their actual titles, roles, and positions within the faction must reflect its invented identity — not playing-card imagery.

Important: Jack, Queen, and King are archetype labels, NOT a power hierarchy. The King is not necessarily the most powerful — all three Targets may have equal rank and influence, or the hierarchy may differ from what the labels suggest. Arrange the three sessions in the order that creates the best narrative escalation for this specific story.

Weak Points are cracks in the enemy faction's armor — key associates, hidden secrets, exploitable resources, or internal tensions that the players can discover and leverage against the Targets.

You MUST respond with ONLY a valid JSON object matching the GameMasterScript schema below.
Do not include any text, explanation, or markdown formatting outside of the JSON object.

GameMasterScript schema:
{
  "hook": string (required) — an opening narrative hook (2-4 sentences) that sets the scene and draws the players into the story,
  "targets": {
    "king": { "name": string (required) — the name of the King-archetype antagonist Target. It doesn't have to match the character's archetype or suit or match the locale of the campaign setting, but it should be plausible for that setting and consistent with the character's identity, "description": string (required) — a brief description of the King Target: who they are, their role within the faction, and why they are dangerous },
    "queen": { "name": string (required) — the name of the Queen-archetype antagonist Target. It doesn't have to match the character's archetype or suit or match the locale of the campaign setting, but it should be plausible for that setting and consistent with the character's identity, "description": string (required) — a brief description of the Queen Target: who they are, their role within the faction, and why they are dangerous },
    "jack": { "name": string (required) — the name of the Jack-archetype antagonist Target. It doesn't have to match the character's archetype or suit or match the locale of the campaign setting, but it should be plausible for that setting and consistent with the character's identity, "description": string (required) — a brief description of the Jack Target: who they are, their role within the faction, and why they are dangerous }
  } (required) — the three antagonist Targets the players must defeat, one per archetype,
  "weakPoints": [
    {
      "name": string (required) — the name of an antagonist Target associate or resource. Might be a person, location, secret, or asset that the players can use to their advantage,
      "role": string (required) — their role in the enemy faction
    }
  ] (required, exactly 10 items) — weak points in the enemy faction that the players can discover and exploit,
  "scenes": string[] — scenarios or encounters for each session that advance the plot and challenge the players, with hints about which approach (capture, convert, eliminate) might be most effective or dramatic for the Target featured in that session,
  "centralTension": string (required) — a one-sentence description of the core conflict driving the campaign,
  "plot": string (required) — a multi-paragraph narrative overview of the full campaign arc, covering the three sessions and the key story beats that connect them
}

Guidelines:
- The hook should reference the campaign setting and hint at the central tension.
- The enemy faction must be given a name and form that fits the campaign setting — do not call it "the Diamonds." Each Target must be a distinct, named antagonist. Give each one a clear role within the faction and a reason they are indispensable to it.
- The campaign spans exactly three sessions. Each session culminates in the defeat of one Target. Arrange sessions for narrative escalation — the order need not follow Jack, Queen, King.
- Each scene should hint at which approach (capture, convert, or eliminate) might be most effective or dramatic for that Target.
- Each weak point must be a distinct character or resource with a unique role and exploitable motive.
- The central tension should tie together the player characters, the setting, and the antagonist Targets.
- The plot should read as a coherent story summary — not a bullet list — connecting all three sessions into a single narrative.
- Tailor all content to the specific player characters and campaign setting provided.`;

export function buildScriptPrompt({
  characters,
  setting,
  language,
}: {
  characters: CharacterSheet[];
  setting: Genre[];
  language: Locale;
}): AIPrompt {
  const characterSummaries = characters
    .map((c, i) => {
      const identity = c.characterIdentity;
      return `Character ${i + 1}:
  Name: ${identity.name}
  Concept: ${identity.concept ?? "N/A"}`;
    })
    .join("\n\n");

  const user = `Generate a GameMasterScript for a three-session campaign with the following party and setting.

Party:
${characterSummaries}

Campaign setting: ${setting.join(", ")}

Language: ${LocaleNames[language]}
All generated text must be written in ${LocaleNames[language]}, exept for the names, which can be in any language but must be consistent with the campaign setting and genre.`;

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
