import type { Campaign } from "~~/shared/types/campaign";
import type { CharacterSheet } from "~~/shared/types/character";

type GenerationStatus = "idle" | "loading" | "done" | "error";

export const useCampaignStore = defineStore("campaign", () => {
  const playerCount = ref(0);
  const campaignSetting = ref<Campaign["setting"]>([]);
  const characters = ref<CharacterSheet[]>([]);
  const gmScript = ref<Campaign["gameMasterScript"]>();
  const generationStatus = ref<GenerationStatus>("idle");

  return {
    playerCount,
    campaignSetting,
    characters,
    gmScript,
    generationStatus,
  };
});
