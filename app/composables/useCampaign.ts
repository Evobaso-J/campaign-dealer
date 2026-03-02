export function useCampaign() {
  const store = useCampaignStore();

  async function fetchCharacters(
    playerCount: number,
    setting: Genre[],
    language: string,
  ): Promise<CharacterSheet[]> {
    return $fetch<CharacterSheet[]>("/api/campaign/characters", {
      method: "POST",
      body: { playerCount, setting, language },
    });
  }

  async function fetchScript(
    characters: CharacterSheet[],
    setting: Genre[],
    language: string,
  ): Promise<GameMasterScript> {
    return $fetch<GameMasterScript>("/api/campaign/script", {
      method: "POST",
      body: { characters, setting, language },
    });
  }

  async function generateCampaign(
    playerCount: number,
    setting: Genre[],
  ): Promise<void> {
    store.reset();
    store.setInput(playerCount, setting);
    store.generationStatus = "generating-characters";

    const locale = useNuxtApp().$i18n.locale.value;

    try {
      const characters = await fetchCharacters(playerCount, setting, locale);
      store.setCharacters(characters);

      const script = await fetchScript(store.characters, setting, locale);
      store.setScript(script);
    } catch (err: unknown) {
      let error = err;
      if (!(error instanceof Error) || !(error instanceof AppError)) {
        error = new AppError("An unexpected error occurred", 500);
      }

      store.setError((error as AppError).message);
    }
  }

  return { generateCampaign, fetchCharacters, fetchScript, store };
}
