import type {
  Campaign,
  Genre,
  GameMasterScript,
} from "~~/shared/types/campaign";
import type { CharacterSheet } from "~~/shared/types/character";

type GenerationStatus =
  | "idle"
  | "generating-characters"
  | "generating-script"
  | "done"
  | "error";

export const useCampaignStore = defineStore("campaign", () => {
  const playerCount = ref(0);
  const campaignSetting = ref<Genre[]>([]);
  const characters = ref<CharacterSheet[]>([]);
  const gmScript = ref<GameMasterScript | undefined>();
  const generationStatus = ref<GenerationStatus>("idle");
  const errorMessage = ref<string | undefined>();

  // --- Getters ---

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

  // --- Actions ---

  function setInput(count: number, setting: Genre[]) {
    playerCount.value = count;
    campaignSetting.value = setting;
  }

  function setCharacters(sheets: CharacterSheet[]) {
    characters.value = sheets;
    generationStatus.value = "generating-script";
  }

  function setScript(script: GameMasterScript) {
    gmScript.value = script;
    generationStatus.value = "done";
  }

  function setError(message: string) {
    errorMessage.value = message;
    generationStatus.value = "error";
  }

  function $reset() {
    playerCount.value = 0;
    campaignSetting.value = [];
    characters.value = [];
    gmScript.value = undefined;
    generationStatus.value = "idle";
    errorMessage.value = undefined;
  }

  return {
    playerCount,
    campaignSetting,
    characters,
    gmScript,
    generationStatus,
    errorMessage,
    isLoading,
    hasResult,
    campaign,
    setInput,
    setCharacters,
    setScript,
    setError,
    $reset,
  };
});
