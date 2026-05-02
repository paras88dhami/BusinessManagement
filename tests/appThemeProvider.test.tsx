// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@nozbe/watermelondb";

let mockSystemColorScheme: "light" | "dark" | null = "light";
let mockAppearanceState = {
  themePreference: "light",
  textSizePreference: "medium",
  compactModeEnabled: false,
  updatedAt: 1,
};
let themeSubscription: (() => void) | null = null;

const {
  mockSetBackgroundColorAsync,
  mockGetAppearanceSettingsState,
} = vi.hoisted(() => ({
  mockSetBackgroundColorAsync: vi.fn(async () => undefined),
  mockGetAppearanceSettingsState: vi.fn(async () => mockAppearanceState),
}));

vi.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: mockSetBackgroundColorAsync,
}));

vi.mock("@/feature/appSettings/data/appSettings.store", () => ({
  getAppearanceSettingsState: mockGetAppearanceSettingsState,
}));

vi.mock("react-native", async () => {
  const ReactModule = await import("react");

  const createHost =
    (tag: string) =>
    ({ children, ...props }: Record<string, unknown>) =>
      ReactModule.createElement(tag, props, children as React.ReactNode);

  return {
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      absoluteFillObject: {},
      hairlineWidth: 1,
    },
    Text: createHost("mock-text"),
    View: createHost("mock-view"),
    useColorScheme: () => mockSystemColorScheme,
  };
});

import {
  AppThemeProvider,
  AppThemeContextValue,
  useAppTheme,
} from "@/shared/components/theme/AppThemeProvider";
import {
  AppearanceTextSizePreference,
  AppearanceThemePreference,
} from "@/feature/appSettings/appearance/types/appearance.types";
import { darkColors, lightColors } from "@/shared/components/theme/colors";

const flushEffects = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const createDatabaseMock = (): Database =>
  ({
    get: () => ({
      query: () => ({
        observeWithColumns: () => ({
          subscribe: (callback: () => void) => {
            themeSubscription = callback;
            return {
              unsubscribe: () => {
                themeSubscription = null;
              },
            };
          },
        }),
      }),
    }),
  }) as unknown as Database;

let latestTheme: AppThemeContextValue | null = null;

function ThemeProbe() {
  latestTheme = useAppTheme();
  return null;
}

describe("AppThemeProvider", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    latestTheme = null;
    themeSubscription = null;
    mockSystemColorScheme = "light";
    mockAppearanceState = {
      themePreference: AppearanceThemePreference.Light,
      textSizePreference: AppearanceTextSizePreference.Medium,
      compactModeEnabled: false,
      updatedAt: 1,
    };
    mockGetAppearanceSettingsState.mockClear();
    mockSetBackgroundColorAsync.mockClear();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("loads the saved light preference", async () => {
    await act(async () => {
      root.render(
        <AppThemeProvider database={createDatabaseMock()}>
          <ThemeProbe />
        </AppThemeProvider>,
      );
      await flushEffects();
    });

    expect(latestTheme?.colorMode).toBe("light");
    expect(latestTheme?.colors.background).toBe(lightColors.background);
    expect(latestTheme?.isDarkMode).toBe(false);
    expect(mockSetBackgroundColorAsync).toHaveBeenCalledWith(
      lightColors.background,
    );
  });

  it("loads the saved dark preference", async () => {
    mockAppearanceState = {
      themePreference: AppearanceThemePreference.Dark,
      textSizePreference: AppearanceTextSizePreference.Medium,
      compactModeEnabled: false,
      updatedAt: 2,
    };

    await act(async () => {
      root.render(
        <AppThemeProvider database={createDatabaseMock()}>
          <ThemeProbe />
        </AppThemeProvider>,
      );
      await flushEffects();
    });

    expect(latestTheme?.colorMode).toBe("dark");
    expect(latestTheme?.colors.background).toBe(darkColors.background);
    expect(latestTheme?.isDarkMode).toBe(true);
    expect(mockSetBackgroundColorAsync).toHaveBeenCalledWith(
      darkColors.background,
    );
  });

  it("updates when appearance settings change and applies text and compact scaling", async () => {
    await act(async () => {
      root.render(
        <AppThemeProvider database={createDatabaseMock()}>
          <ThemeProbe />
        </AppThemeProvider>,
      );
      await flushEffects();
    });

    mockAppearanceState = {
      themePreference: AppearanceThemePreference.Dark,
      textSizePreference: AppearanceTextSizePreference.Large,
      compactModeEnabled: true,
      updatedAt: 3,
    };

    await act(async () => {
      themeSubscription?.();
      await flushEffects();
    });

    expect(latestTheme?.colorMode).toBe("dark");
    expect(latestTheme?.preferences.textSizePreference).toBe(
      AppearanceTextSizePreference.Large,
    );
    expect(latestTheme?.compactModeEnabled).toBe(true);
    expect(latestTheme?.scaleText(10)).toBe(11.2);
    expect(latestTheme?.scaleLineHeight(20)).toBe(22);
    expect(latestTheme?.scaleSpace(16)).toBe(13);
    expect(mockSetBackgroundColorAsync).toHaveBeenLastCalledWith(
      darkColors.background,
    );
  });
});
