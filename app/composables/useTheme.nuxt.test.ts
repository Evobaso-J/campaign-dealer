import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { GENRE_THEMES, useTheme, type ThemePreset } from "./useTheme";

const mockAppConfig = {
  ui: { colors: { primary: "terminal", neutral: "slate", error: "red" } },
};

mockNuxtImport("useAppConfig", () =>
  vi.fn(() => {
    return mockAppConfig;
  }),
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useTheme", () => {
  it("applyPreset sets appConfig colors", () => {
    const { applyPreset } = useTheme();

    applyPreset("horror");

    expect(mockAppConfig.ui.colors.primary).toBe("horror");
    expect(mockAppConfig.ui.colors.neutral).toBe("zinc");
  });

  it("currentPreset reflects applied preset", () => {
    const { applyPreset, currentPreset } = useTheme();

    applyPreset("scifi");

    expect(currentPreset.value).toBe("scifi");
  });

  it("currentPreset setter applies the preset", () => {
    const { currentPreset } = useTheme();

    currentPreset.value = "fantasy";

    expect(mockAppConfig.ui.colors.primary).toBe("fantasy");
    expect(mockAppConfig.ui.colors.neutral).toBe("slate");
  });

  it("currentPreset falls back to default for unknown color combo", () => {
    const { currentPreset } = useTheme();

    mockAppConfig.ui.colors.primary = "pink";
    mockAppConfig.ui.colors.neutral = "zinc";

    expect(currentPreset.value).toBe("terminal");
  });

  it("reset restores terminal defaults", () => {
    const { applyPreset, reset } = useTheme();

    applyPreset("cultural");
    expect(mockAppConfig.ui.colors.primary).toBe("cultural");

    reset();

    expect(mockAppConfig.ui.colors.primary).toBe(GENRE_THEMES.terminal.primary);
    expect(mockAppConfig.ui.colors.neutral).toBe(GENRE_THEMES.terminal.neutral);
  });

  it("each preset maps to expected colors", () => {
    const { applyPreset } = useTheme();

    for (const [name, expected] of Object.entries(GENRE_THEMES)) {
      applyPreset(name as ThemePreset);

      expect(mockAppConfig.ui.colors.primary).toBe(expected.primary);
      expect(mockAppConfig.ui.colors.neutral).toBe(expected.neutral);
    }
  });
});
