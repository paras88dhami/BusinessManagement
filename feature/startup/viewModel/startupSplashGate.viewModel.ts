import { StartupBootstrapStatusValue } from "@/feature/startup/types/startup.types";

export type UseStartupSplashGateViewModelParams = {
  fontsLoaded: boolean;
  startupStatus: StartupBootstrapStatusValue;
  isSessionLoading: boolean;
};

export interface StartupSplashGateViewModel {
  shouldRenderAnimatedSplash: boolean;
  shouldAnimateSplash: boolean;
  onAnimatedSplashFinish: () => void;
}
