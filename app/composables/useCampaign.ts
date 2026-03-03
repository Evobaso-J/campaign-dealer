export function useCampaign() {
  const store = useCampaignStore();

  async function generateCharacters(
    playerCount: number,
    setting: Genre[],
  ): Promise<void> {
    store.reset();
    store.setInput(playerCount, setting);
    store.generationStatus = "generating-characters";

    const {
      $i18n: { locale },
    } = useNuxtApp();

    try {
      const characters = await $fetch<CharacterSheet[]>(
        "/api/campaign/characters",
        {
          method: "POST",
          body: { playerCount, setting, language: unref(locale) },
        },
      );
      store.setCharacters(characters);
    } catch (err: unknown) {
      let error = err;
      if (!(error instanceof Error) || !(error instanceof AppError)) {
        error = new AppError("An unexpected error occurred", 500);
      }
      store.setError((error as AppError).message);
    }
  }

  async function generateScript(setting: Genre[]): Promise<void> {
    if (!store.characters.length) {
      throw new AppError("No characters to generate a script for", 400);
    }

    store.generationStatus = "generating-script";

    const {
      $i18n: { locale },
    } = useNuxtApp();

    try {
      const script = await $fetch<GameMasterScript>("/api/campaign/script", {
        method: "POST",
        body: {
          characters: store.characters,
          setting,
          language: unref(locale),
        },
      });
      store.setScript(script);
    } catch (err: unknown) {
      let error = err;
      if (!(error instanceof Error) || !(error instanceof AppError)) {
        error = new AppError("An unexpected error occurred", 500);
      }
      store.setError((error as AppError).message);
    }
  }

  return { generateCharacters, generateScript };
}
