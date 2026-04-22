import {
  StartupBootstrapStatus,
  StartupBootstrapStatusValue,
} from "@/feature/startup/types/startup.types";

export type StartupPresentationState = {
  shouldMountSessionProvider: boolean;
  shouldRenderFailureScreen: boolean;
};

type ResolveStartupPresentationStateParams = {
  fontsLoaded: boolean;
  startupStatus: StartupBootstrapStatusValue;
};

export const resolveStartupPresentationState = ({
  fontsLoaded,
  startupStatus,
}: ResolveStartupPresentationStateParams): StartupPresentationState => {
  return {
    shouldMountSessionProvider:
      fontsLoaded && startupStatus === StartupBootstrapStatus.Ready,
    shouldRenderFailureScreen:
      startupStatus === StartupBootstrapStatus.Failed,
  };
};
