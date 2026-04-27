import type { GeneratedText } from "./utils";

export const Locales = ["en", "it"] as const;
export type Locale = (typeof Locales)[number];

export const LocaleNames: Record<Locale, string> = {
  en: "English",
  it: "Italian",
};

export type TargetArchetype = "king" | "queen" | "jack";

export const ContentWarnings = [
  "deathAndViolence",
  "strongLanguage",
  "horror",
  "substanceUse",
  "mentalIllness",
] as const;
export type ContentWarning = (typeof ContentWarnings)[number];
export type TargetFate = "captured" | "converted" | "eliminated";

export interface TargetEnemy {
  name: GeneratedText;
  description: GeneratedText;
  locations: GeneratedText;
  defenses: GeneratedText;
  fate?: TargetFate;
  notes?: string;
}

export const GenreGroups = {
  fantasy: [
    "highFantasy", // Heroic, magic-heavy, epic stakes (D&D/Pathfinder)
    "darkFantasy", // Gritty, lethal, morally grey (Witcher/Dark Souls)
    "swordAndSorcery", // Low-magic, pulp action, personal survival (Conan)
    "mythicFantasy", // Gods, demigods, and legendary trials (Percy Jackson/Hades)
  ],
  scifi: [
    "cyberpunk", // Dystopian tech, hacking, urban rebellion (Cyberpunk/Shadowrun)
    "spaceOpera", // Galactic empires, aliens, starships (Star Wars/Mass Effect)
    "hardScifi", // Realistic tech, physics-based survival (The Expanse)
    "postApocalyptic", // Ruined worlds, scavenging, rebuilding (Fallout/Mad Max)
  ],
  horror: [
    "cosmicHorror", // Sanity-draining eldritch gods (Call of Cthulhu)
    "gothicHorror", // Cursed castles, vampires, Victorian dread (Ravenloft)
    "survivalHorror", // Resource management, claustrophobia (Resident Evil/Alien)
    "folkHorror", // Isolated cults, ancient superstitions (The Wicker Man/Midsommar)
  ],
  modern: [
    "urbanFantasy", // Hidden magic in modern cities (World of Darkness/Dresden)
    "superhero", // Vigilantes, superpowers, and secret identities (Mutants & Masterminds)
    "conspiracy", // Espionage, X-Files, government secrets (Delta Green)
    "weirdWest", // Six-shooters, occultism, and frontier grit (Deadlands)
  ],
  cultural: [
    "wuxia", // Martial arts mastery, honor, and Chi (Crouching Tiger)
    "isekai", // Portal fantasy, fish-out-of-water (Trapped in a game/world)
    "chanbara", // Samurai drama, ronin, and feudal politics
    "steampunk", // Industrial revolution + magic/tech (Replaces 'Aesthetic')
  ],
} as const;

export type GenreGroup = keyof typeof GenreGroups;
export type Genre = (typeof GenreGroups)[GenreGroup][number];

export type GameMasterScript = {
  /** A short, evocative campaign title. */
  name: GeneratedText;
  /** Multi-paragraph, in-world first-person narrative. The GM reads it aloud to set the scene. */
  introduction: GeneratedText;
  /** Setting-appropriate weapon names available to the characters. */
  weapons: GeneratedText[];
  /** Setting-appropriate tool and instrument names available to the characters. */
  instruments: GeneratedText[];
  /** One antagonist Target per archetype (king, queen, jack). */
  targets: { [key in TargetArchetype]: TargetEnemy };
  /** In-world dialogue quotes — rumors and leads about the faction's vulnerabilities. */
  rumors: GeneratedText[];
  /** Optional sensitive content tags (e.g. death/violence, horror, substance use). */
  contentWarnings?: ContentWarning[];
};

export interface Campaign {
  name: string;
  setting: Genre[];
  compromised: boolean;
  notes?: string;
  gameMasterScript: GameMasterScript;
}
