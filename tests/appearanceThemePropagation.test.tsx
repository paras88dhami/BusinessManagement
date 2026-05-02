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

vi.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: vi.fn(async () => undefined),
}));

vi.mock("@/feature/appSettings/data/appSettings.store", () => ({
  getAppearanceSettingsState: vi.fn(async () => mockAppearanceState),
}));

vi.mock("react-native", async () => {
  const ReactModule = await import("react");

  const createHost =
    (tag: string, serializeStyle = false) =>
    ({ children, style, ...props }: Record<string, unknown>) =>
      ReactModule.createElement(
        tag,
        serializeStyle
          ? { ...props, "data-style": JSON.stringify(style ?? null) }
          : props,
        children as React.ReactNode,
      );

  return {
    ActivityIndicator: createHost("mock-activity-indicator", true),
    Pressable: createHost("mock-pressable", true),
    ScrollView: createHost("mock-scroll-view", true),
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      absoluteFillObject: {},
      hairlineWidth: 1,
    },
    Text: createHost("mock-text", true),
    TextInput: createHost("mock-text-input", true),
    View: createHost("mock-view", true),
    useColorScheme: () => mockSystemColorScheme,
  };
});

vi.mock("@/shared/components/reusable/Cards/Card", async () => {
  const ReactModule = await import("react");
  const createHost =
    (tag: string) =>
    ({ children, style, ...props }: Record<string, unknown>) =>
      ReactModule.createElement(
        tag,
        { ...props, "data-style": JSON.stringify(style ?? null) },
        children as React.ReactNode,
      );

  return {
    Card: createHost("mock-card"),
    CardPressable: createHost("mock-card-pressable"),
  };
});

vi.mock("@/shared/components/reusable/Icons/DirectionArrowIcon", async () => {
  const ReactModule = await import("react");
  return {
    DirectionArrowIcon: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-direction-arrow-icon", props),
  };
});

vi.mock("@/shared/components/reusable/ScreenLayouts/ScreenContainer", async () => {
  const ReactModule = await import("react");
  return {
    ScreenContainer: ({ children, ...props }: Record<string, unknown>) =>
      ReactModule.createElement(
        "mock-screen-container",
        props,
        children as React.ReactNode,
      ),
  };
});

vi.mock("@/shared/components/reusable/Charts/FinancialCharts", async () => {
  const ReactModule = await import("react");
  return {
    LineAreaChart: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-line-area-chart", props),
  };
});

vi.mock("@/shared/components/reusable/Tables/TransactionTable", async () => {
  const ReactModule = await import("react");
  return {
    TransactionTable: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-transaction-table", props),
  };
});

vi.mock("lucide-react-native", async () => {
  const ReactModule = await import("react");

  const createIcon =
    (tag: string) =>
    (props: Record<string, unknown>) =>
      ReactModule.createElement(tag, props);

  return {
    AlertCircle: createIcon("mock-alert-circle"),
    ArrowLeftRight: createIcon("mock-arrow-left-right"),
    ClipboardList: createIcon("mock-clipboard-list"),
    Package: createIcon("mock-package"),
    ReceiptText: createIcon("mock-receipt-text"),
    Users: createIcon("mock-users"),
  };
});

import { AppThemeProvider } from "@/shared/components/theme/AppThemeProvider";
import {
  AppearanceTextSizePreference,
  AppearanceThemePreference,
} from "@/feature/appSettings/appearance/types/appearance.types";
import { BusinessDashboardScreen } from "@/feature/dashboard/business/ui/BusinessDashboardScreen";
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

const viewModel = {
  summaryCards: [
    { id: "receive", title: "To Receive", value: "Rs 100", tone: "receive" },
    { id: "pay", title: "To Pay", value: "Rs 40", tone: "pay" },
  ],
  todayInValue: "Rs 50",
  todayOutValue: "Rs 20",
  overdueCountLabel: "2",
  isLoading: false,
  errorMessage: null,
  quickActions: [
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "billing", label: "Billing" },
    { id: "contacts", label: "Contacts" },
    { id: "ledger", label: "Ledger" },
  ],
  onQuickActionPress: vi.fn(),
  profitOverviewSeries: [],
  currencyPrefix: "Rs",
  todayTransactionRows: [],
};

const findTextStyle = (
  container: HTMLElement,
  textContent: string,
): Record<string, unknown> | null => {
  const match = Array.from(container.querySelectorAll("mock-text")).find(
    (element) => element.textContent === textContent,
  );

  if (!match) {
    return null;
  }

  const serializedStyle = match.getAttribute("data-style");
  return serializedStyle ? (JSON.parse(serializedStyle) as Record<string, unknown>) : null;
};

describe("appearance theme propagation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    themeSubscription = null;
    mockSystemColorScheme = "light";
    mockAppearanceState = {
      themePreference: AppearanceThemePreference.Light,
      textSizePreference: AppearanceTextSizePreference.Medium,
      compactModeEnabled: false,
      updatedAt: 1,
    };
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("updates a migrated screen title color when the theme changes", async () => {
    await act(async () => {
      root.render(
        <AppThemeProvider database={createDatabaseMock()}>
          <BusinessDashboardScreen viewModel={viewModel as never} />
        </AppThemeProvider>,
      );
      await flushEffects();
    });

    expect(findTextStyle(container, "Quick Actions")?.color).toBe(
      lightColors.foreground,
    );

    mockAppearanceState = {
      themePreference: AppearanceThemePreference.Dark,
      textSizePreference: AppearanceTextSizePreference.Large,
      compactModeEnabled: true,
      updatedAt: 2,
    };

    await act(async () => {
      themeSubscription?.();
      await flushEffects();
    });

    expect(findTextStyle(container, "Quick Actions")?.color).toBe(
      darkColors.foreground,
    );
  });
});
