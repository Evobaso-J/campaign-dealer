import type {
  Campaign,
  Genre,
  GameMasterScript,
} from "~~/shared/types/campaign";
import type { CharacterSheet } from "~~/shared/types/character";
import type { CharacterTemplate } from "~~/shared/utils/characterRandomizer";

type GenerationStatus =
  | "idle"
  | "generating-characters"
  | "characters-ready"
  | "generating-script"
  | "done"
  | "error";

export const useCampaignStore = defineStore("campaign", () => {
  const selectedTemplates = ref<CharacterTemplate[]>([]);
  const campaignSetting = ref<Genre[]>([]);
  const characters = ref<CharacterSheet[]>([]);
  const gmScript = ref<GameMasterScript | undefined>();
  const generationStatus = ref<GenerationStatus>("idle");
  const errorMessage = ref<string | undefined>();

  const isLoading = computed(
    () =>
      generationStatus.value === "generating-characters" ||
      generationStatus.value === "generating-script",
  );

  const hasResult = computed(() => generationStatus.value === "done");

  const campaign = computed<Campaign | undefined>(() => {
    if (generationStatus.value !== "done" || !gmScript.value) {
      return undefined;
    }
    return {
      name: "",
      setting: campaignSetting.value,
      compromised: false,
      gameMasterScript: gmScript.value,
    };
  });

  const setGenres = (setting: Genre[]) => {
    campaignSetting.value = setting;
  };

  const setCharacters = (sheets: CharacterSheet[]) => {
    characters.value = sheets;
    generationStatus.value = "characters-ready";
  };

  const setScript = (script: GameMasterScript) => {
    gmScript.value = script;
    generationStatus.value = "done";
  };

  const setError = (message: string) => {
    errorMessage.value = message;
    generationStatus.value = "error";
  };

  const reset = () => {
    selectedTemplates.value = [];
    campaignSetting.value = [];
    characters.value = [];
    gmScript.value = undefined;
    generationStatus.value = "idle";
    errorMessage.value = undefined;
  };

  return {
    selectedTemplates,
    campaignSetting,
    characters,
    gmScript,
    generationStatus,
    errorMessage,
    isLoading,
    hasResult,
    campaign,
    setGenres,
    setCharacters,
    setScript,
    setError,
    reset,
  };
});
