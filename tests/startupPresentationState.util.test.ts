import { describe, expect, it } from "vitest";
import { StartupBootstrapStatus } from "@/feature/startup/types/startup.types";
import { resolveStartupPresentationState } from "@/feature/startup/utils/resolveStartupPresentationState.util";

describe("startup presentation state", () => {
  it("does not mount the session provider while startup is still loading", () => {
    const result = resolveStartupPresentationState({
      fontsLoaded: true,
      startupStatus: StartupBootstrapStatus.Loading,
    });

    expect(result).toEqual({
      shouldMountSessionProvider: false,
      shouldRenderFailureScreen: false,
    });
  });

  it("renders the failure screen when startup fails even if fonts are not loaded", () => {
    const result = resolveStartupPresentationState({
      fontsLoaded: false,
      startupStatus: StartupBootstrapStatus.Failed,
    });

    expect(result).toEqual({
      shouldMountSessionProvider: false,
      shouldRenderFailureScreen: true,
    });
  });

  it("mounts the session provider only when startup is ready and fonts are loaded", () => {
    const result = resolveStartupPresentationState({
      fontsLoaded: true,
      startupStatus: StartupBootstrapStatus.Ready,
    });

    expect(result).toEqual({
      shouldMountSessionProvider: true,
      shouldRenderFailureScreen: false,
    });
  });

  it("does not mount the session provider when startup is ready but fonts are not loaded", () => {
    const result = resolveStartupPresentationState({
      fontsLoaded: false,
      startupStatus: StartupBootstrapStatus.Ready,
    });

    expect(result).toEqual({
      shouldMountSessionProvider: false,
      shouldRenderFailureScreen: false,
    });
  });
});
