import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

export const genreIcons: Record<Genre, string> = {
  highFantasy: "i-pixelarticons-sword",
  darkFantasy: "i-pixelarticons-skull",
  swordAndSorcery: "i-pixelarticons-shield",
  mythicFantasy: "i-pixelarticons-crown",
  cyberpunk: "i-pixelarticons-cpu",
  spaceOpera: "i-pixelarticons-globe",
  hardScifi: "i-pixelarticons-circuit-board",
  postApocalyptic: "i-pixelarticons-warning-diamond",
  cosmicHorror: "i-pixelarticons-eye",
  gothicHorror: "i-pixelarticons-castle",
  survivalHorror: "i-pixelarticons-heart",
  folkHorror: "i-pixelarticons-tree-pine",
  urbanFantasy: "i-pixelarticons-building",
  superhero: "i-pixelarticons-zap",
  conspiracy: "i-pixelarticons-search",
  weirdWest: "i-pixelarticons-target",
  wuxia: "i-pixelarticons-wind",
  isekai: "i-pixelarticons-door-closed",
  chanbara: "i-pixelarticons-feather",
  steampunk: "i-pixelarticons-settings-cog",
};

export const genreGroupConfig: Record<
  GenreGroup,
  { class: string; icon: string; border: string; text: string }
> = {
  fantasy: {
    class: "dither-md [--dither-color:var(--color-fantasy-400)]",
    icon: "text-fantasy-400",
    border: "border-fantasy-500",
    text: "text-fantasy-600",
  },
  scifi: {
    class: "dither-sm [--dither-color:var(--color-scifi-400)]",
    icon: "text-scifi-400",
    border: "border-scifi-500",
    text: "text-scifi-600",
  },
  horror: {
    class: "dither-md [--dither-color:var(--color-horror-400)]",
    icon: "text-horror-400",
    border: "border-horror-500",
    text: "text-horror-600",
  },
  modern: {
    class: "dither-sm [--dither-color:var(--color-modern-400)]",
    icon: "text-modern-400",
    border: "border-modern-500",
    text: "text-modern-600",
  },
  cultural: {
    class: "dither-md [--dither-color:var(--color-cultural-400)]",
    icon: "text-cultural-400",
    border: "border-cultural-500",
    text: "text-cultural-600",
  },
};

const genreToGroup = new Map<Genre, GenreGroup>();
for (const [group, genres] of Object.entries(GenreGroups)) {
  for (const genre of genres) {
    genreToGroup.set(genre as Genre, group as GenreGroup);
  }
}

export function getGenreGroup(genre: Genre): GenreGroup {
  const group = genreToGroup.get(genre);
  if (!group) throw new Error(`Unknown genre: ${genre}`);
  return group;
}
