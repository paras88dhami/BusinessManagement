import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StartupBootstrapStatus } from "@/feature/startup/types/startup.types";
import {
  StartupSplashGateViewModel,
  UseStartupSplashGateViewModelParams,
} from "@/feature/startup/viewModel/startupSplashGate.viewModel";

export const useStartupSplashGateViewModel = ({
  fontsLoaded,
  startupStatus,
  isSessionLoading,
}: UseStartupSplashGateViewModelParams): StartupSplashGateViewModel => {
  const [hasNativeSplashHidden, setHasNativeSplashHidden] = useState(false);
  const [hasAnimatedSplashFinished, setHasAnimatedSplashFinished] =
    useState(false);
  const isHidingNativeSplashRef = useRef(false);

  const isStartupReady = startupStatus === StartupBootstrapStatus.Ready;
  const isStartupFailed = startupStatus === StartupBootstrapStatus.Failed;

  const shouldHideNativeSplash =
    fontsLoaded && (isStartupFailed || (isStartupReady && !isSessionLoading));

  useEffect(() => {
    if (!shouldHideNativeSplash || hasNativeSplashHidden || isHidingNativeSplashRef.current) {
      return;
    }

    isHidingNativeSplashRef.current = true;

    void SplashScreen.hideAsync()
      .catch(() => undefined)
      .finally(() => {
        setHasNativeSplashHidden(true);
        isHidingNativeSplashRef.current = false;
      });
  }, [hasNativeSplashHidden, shouldHideNativeSplash]);

  useEffect(() => {
    if (startupStatus === StartupBootstrapStatus.Loading) {
      setHasAnimatedSplashFinished(false);
      setHasNativeSplashHidden(false);
      isHidingNativeSplashRef.current = false;
    }
  }, [startupStatus]);

  const onAnimatedSplashFinish = useCallback(() => {
    setHasAnimatedSplashFinished(true);
  }, []);

  const shouldShowAnimatedSplash = useMemo(() => {
    return isStartupReady && hasNativeSplashHidden && !hasAnimatedSplashFinished;
  }, [hasAnimatedSplashFinished, hasNativeSplashHidden, isStartupReady]);

  return useMemo(
    () => ({
      shouldShowAnimatedSplash,
      onAnimatedSplashFinish,
    }),
    [onAnimatedSplashFinish, shouldShowAnimatedSplash],
  );
};
