// @vitest-environment jsdom

import React, { act, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { hideAsyncMock } = vi.hoisted(() => ({
  hideAsyncMock: vi.fn(async () => undefined),
}));

vi.mock("expo-splash-screen", () => ({
  hideAsync: hideAsyncMock,
}));

import { StartupBootstrapStatus } from "@/feature/startup/types/startup.types";
import { useStartupSplashGateViewModel } from "@/feature/startup/viewModel/startupSplashGate.viewModel.impl";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type HarnessProps = {
  fontsLoaded: boolean;
  startupStatus: (typeof StartupBootstrapStatus)[keyof typeof StartupBootstrapStatus];
  isSessionLoading: boolean;
  onUpdate: (value: ReturnType<typeof useStartupSplashGateViewModel>) => void;
};

function StartupSplashGateHarness(props: HarnessProps) {
  const viewModel = useStartupSplashGateViewModel({
    fontsLoaded: props.fontsLoaded,
    startupStatus: props.startupStatus,
    isSessionLoading: props.isSessionLoading,
  });

  useEffect(() => {
    props.onUpdate(viewModel);
  }, [props, viewModel]);

  return null;
}

const flushEffects = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("startupSplashGate.viewModel", () => {
  let container: HTMLDivElement;
  let root: Root;
  let latestViewModel: ReturnType<typeof useStartupSplashGateViewModel> | null =
    null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    latestViewModel = null;
    hideAsyncMock.mockClear();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  const renderHarness = async (
    overrides: Partial<Omit<HarnessProps, "onUpdate">> = {},
  ) => {
    const props: HarnessProps = {
      fontsLoaded: true,
      startupStatus: StartupBootstrapStatus.Ready,
      isSessionLoading: true,
      onUpdate: (value) => {
        latestViewModel = value;
      },
      ...overrides,
    };

    await act(async () => {
      root.render(<StartupSplashGateHarness {...props} />);
      await flushEffects();
    });

    return props;
  };

  it("renders the splash overlay before native splash hide completes and starts animating after it hides", async () => {
    const props = await renderHarness();

    expect(latestViewModel?.shouldRenderAnimatedSplash).toBe(true);
    expect(latestViewModel?.shouldAnimateSplash).toBe(false);
    expect(hideAsyncMock).not.toHaveBeenCalled();

    await act(async () => {
      root.render(
        <StartupSplashGateHarness
          {...props}
          isSessionLoading={false}
          onUpdate={(value) => {
            latestViewModel = value;
          }}
        />,
      );
      await flushEffects();
    });

    expect(hideAsyncMock).toHaveBeenCalledTimes(1);
    expect(latestViewModel?.shouldRenderAnimatedSplash).toBe(true);
    expect(latestViewModel?.shouldAnimateSplash).toBe(true);
  });

  it("removes the overlay after the animated splash finishes", async () => {
    const props = await renderHarness({
      isSessionLoading: false,
    });

    await act(async () => {
      root.render(<StartupSplashGateHarness {...props} />);
      await flushEffects();
    });

    expect(latestViewModel?.shouldAnimateSplash).toBe(true);

    await act(async () => {
      latestViewModel?.onAnimatedSplashFinish();
      await flushEffects();
    });

    expect(latestViewModel?.shouldRenderAnimatedSplash).toBe(false);
    expect(latestViewModel?.shouldAnimateSplash).toBe(false);
  });
});
