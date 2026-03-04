import type { GenreGroup } from "~~/shared/types/campaign";

/**
 * Maps each GenreGroup to the Tailwind color family name defined in @theme.
 * "fantasy" maps to "gb" (the default), all others match their GenreGroup key.
 */
const themeColorMap: Record<GenreGroup, string> = {
  fantasy: "gb",
  scifi: "scifi",
  horror: "horror",
  modern: "modern",
  cultural: "cultural",
  aesthetic: "aesthetic",
};

const DEFAULT_COLOR = "gb";

/**
 * Reactively syncs the active genre theme from the campaign store
 * to Nuxt UI's color system via `useAppConfig()`.
 *
 * Call once in app.vue — no return value needed.
 */
export function useTheme() {
  const store = useCampaignStore();
  const appConfig = useAppConfig();

  watch(
    () => store.activeTheme,
    (theme) => {
      const color = theme ? themeColorMap[theme] : DEFAULT_COLOR;
      appConfig.ui!.colors!.primary = color;
      appConfig.ui!.colors!.secondary = color;
      appConfig.ui!.colors!.success = color;
      appConfig.ui!.colors!.info = color;
      appConfig.ui!.colors!.neutral = color;
    },
    { immediate: true },
  );
}
