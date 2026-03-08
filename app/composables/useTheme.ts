export const GENRE_THEMES = {
  terminal: { primary: "green", neutral: "slate" },
  fantasy: { primary: "violet", neutral: "slate" },
  scifi: { primary: "cyan", neutral: "slate" },
  horror: { primary: "red", neutral: "zinc" },
  modern: { primary: "indigo", neutral: "gray" },
  cultural: { primary: "amber", neutral: "stone" },
  aesthetic: { primary: "yellow", neutral: "stone" },
} as const;

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
