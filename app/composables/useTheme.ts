export const GENRE_THEMES = {
  terminal: { primary: "terminal", neutral: "slate" },
  fantasy: { primary: "fantasy", neutral: "slate" },
  scifi: { primary: "scifi", neutral: "slate" },
  horror: { primary: "horror", neutral: "zinc" },
  modern: { primary: "modern", neutral: "gray" },
  cultural: { primary: "cultural", neutral: "stone" },
} as const satisfies Record<
  GenreGroup | "terminal",
  { primary: string; neutral: string }
>;

export type ThemePreset = keyof typeof GENRE_THEMES;

const DEFAULT_PRESET: ThemePreset = "terminal";

export function useTheme() {
  const appConfig = useAppConfig();

  const currentPreset = computed<ThemePreset>({
    get() {
      const theme = Object.entries(GENRE_THEMES).find(
        ([, t]) =>
          t.primary === appConfig.ui.colors.primary &&
          t.neutral === appConfig.ui.colors.neutral,
      );
      return (theme?.[0] as ThemePreset) ?? DEFAULT_PRESET;
    },
    set(preset: ThemePreset) {
      applyPreset(preset);
    },
  });

  function applyPreset(preset: ThemePreset) {
    const theme = GENRE_THEMES[preset];
    appConfig.ui.colors.primary = theme.primary;
    appConfig.ui.colors.neutral = theme.neutral;
  }

  function reset() {
    applyPreset(DEFAULT_PRESET);
  }

  return { currentPreset, applyPreset, reset, GENRE_THEMES, DEFAULT_PRESET };
}
