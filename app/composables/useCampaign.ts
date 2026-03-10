import type { CharacterTemplate } from "~~/shared/utils/characterRandomizer";

export function useCampaign() {
  const campaign = useCampaignStore();

  async function generateCharacters(
    templates: CharacterTemplate[],
    setting: Genre[],
  ): Promise<void> {
    campaign.reset();
    campaign.setInput(setting);
    campaign.generationStatus = "generating-characters";

    const {
      $i18n: { locale },
    } = useNuxtApp();

    try {
      const characters = await $fetch<CharacterSheet[]>(
        "/api/campaign/characters",
        {
          method: "POST",
          body: { templates, setting, language: unref(locale) },
        },
      );
      campaign.setCharacters(characters);
    } catch (err: unknown) {
      let error = err;
      if (!(error instanceof Error) || !(error instanceof AppError)) {
        error = new AppError("An unexpected error occurred", 500);
      }
      campaign.setError((error as AppError).message);
    }
  }

  async function generateScript(): Promise<void> {
    if (!campaign.characters.length) {
      throw new AppError("No characters to generate a script for", 400);
    }
    if (!campaign.campaignSetting.length) {
      throw new AppError("No campaign setting provided", 400);
    }

    campaign.generationStatus = "generating-script";

    const {
      $i18n: { locale },
    } = useNuxtApp();

    try {
      const script = await $fetch<GameMasterScript>("/api/campaign/script", {
        method: "POST",
        body: {
          characters: campaign.characters,
          setting: campaign.campaignSetting,
          language: unref(locale),
        },
      });
      campaign.setScript(script);
    } catch (err: unknown) {
      let error = err;
      if (!(error instanceof Error) || !(error instanceof AppError)) {
        error = new AppError("An unexpected error occurred", 500);
      }
      campaign.setError((error as AppError).message);
    }
  }

  return { generateCharacters, generateScript };
}
