import type { CharacterSuit } from "./character";

type TargetArchetype = "king" | "queen" | "jack";
type TargetFate = "captured" | "converted" | "eliminated";

interface TargetEnemy {
  name: string;
  fate: TargetFate;
  notes?: string;
}

interface WeakPoint {
  value: number;
  switchedWith?: CharacterSuit;
  notes?: string;
}

export const GenreGroups = {
  fantasy: [
    "highFantasy", // https://en.wikipedia.org/wiki/High_fantasy
    "darkFantasy", // https://en.wikipedia.org/wiki/Dark_fantasy
    "swordAndSorcery", // https://en.wikipedia.org/wiki/Sword_and_sorcery
    "mythicFantasy", // https://en.wikipedia.org/wiki/Mythic_fiction
  ],
  scifi: [
    "scienceFantasy", // https://en.wikipedia.org/wiki/Science_fantasy
    "cyberpunk", // https://en.wikipedia.org/wiki/Cyberpunk
    "spaceOpera", // https://en.wikipedia.org/wiki/Space_opera
    "postApocalyptic", // https://en.wikipedia.org/wiki/Post-apocalyptic_fiction
  ],
  horror: [
    "gothicHorror", // https://en.wikipedia.org/wiki/Gothic_fiction
    "cosmicHorror", // https://en.wikipedia.org/wiki/Lovecraftian_horror
    "survivalHorror", // https://en.wikipedia.org/wiki/Survival_horror
  ],
  modern: [
    "urbanFantasy", // https://en.wikipedia.org/wiki/Urban_fantasy
    "superhero", // https://en.wikipedia.org/wiki/Superhero_fiction
    "alternateHistory", // https://en.wikipedia.org/wiki/Alternate_history
    "conspiracyThriller", // https://en.wikipedia.org/wiki/Conspiracy_fiction
  ],
  cultural: [
    "wuxia", // https://en.wikipedia.org/wiki/Wuxia
    "isekai", // https://en.wikipedia.org/wiki/Isekai
    "weirdWest", // https://en.wikipedia.org/wiki/Weird_West
  ],
  aesthetic: [
    "steampunk", // https://en.wikipedia.org/wiki/Steampunk
    "dieselpunk", // https://en.wikipedia.org/wiki/Dieselpunk
    "biopunk", // https://en.wikipedia.org/wiki/Biopunk
    "clockpunk", // https://en.wikipedia.org/wiki/Cyberpunk_derivatives#Clockpunk
  ],
} as const;

export type GenreGroup = keyof typeof GenreGroups;
type Genre = (typeof GenreGroups)[GenreGroup][number];

type GameMasterScript = {
  hook: string;
  /**
   * A list of 10 weak points for the antagonist Targets, with a brief description of each.
   * The game master can use these to create tension and drama in the story, as the players discover and exploit the targets' weaknesses.
   */
  weakPoints: {
    name: string;
    role: string;
    motive: string;
  }[];
  scenes: string[];
  centralTension: string;
};

export interface Campaign {
  name: string;
  setting: Genre[];
  compromised: boolean;
  targets: { [key in TargetArchetype]: TargetEnemy };
  weakPoints: WeakPoint[];
  notes?: string;
  gameMasterScript: GameMasterScript;
}
