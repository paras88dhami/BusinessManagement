import React from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import appDatabase from "@/shared/database/appDatabase";
import {
  AppRouteSessionStatus,
  AppRouteSessionProvider,
  useAppRouteSession,
} from "@/feature/session/ui/AppRouteSessionProvider";
import { colors } from "@/shared/components/theme/colors";
import { useCurrentLanguageCode } from "@/shared/i18n/resources";
import { applyGlobalTypographyDefaults } from "@/shared/components/theme/typography";
import { StartupBootstrapStatus } from "@/feature/startup/types/startup.types";
import { useStartupBootstrapFactory } from "@/feature/startup/factory/useStartupBootstrap.factory";
import { useStartupSplashGateViewModel } from "@/feature/startup/viewModel/startupSplashGate.viewModel.impl";
import { AnimatedSplashScreen } from "@/feature/startup/ui/AnimatedSplashScreen";
import { StartupErrorScreen } from "@/feature/startup/ui/StartupErrorScreen";

applyGlobalTypographyDefaults();

void SplashScreen.preventAutoHideAsync().catch(() => {
  return undefined;
});

type StartupOverlayControllerProps = {
  fontsLoaded: boolean;
  startupStatus: StartupBootstrapStatusValue;
};

type StartupBootstrapStatusValue =
  (typeof StartupBootstrapStatus)[keyof typeof StartupBootstrapStatus];

type RootNavigatorProps = {
  languageCode: string;
  startupStatus: StartupBootstrapStatusValue;
  startupErrorMessage: string | null;
  fontsLoaded: boolean;
  onRetryStartup: (() => Promise<void>) | null;
};

function StartupOverlayController({
  fontsLoaded,
  startupStatus,
}: StartupOverlayControllerProps) {
  const { isLoading } = useAppRouteSession();

  const splashGateViewModel = useStartupSplashGateViewModel({
    fontsLoaded,
    startupStatus,
    isSessionLoading: isLoading,
  });

  if (!splashGateViewModel.shouldShowAnimatedSplash) {
    return null;
  }

  return (
    <View style={styles.startupOverlay} pointerEvents="auto">
      <AnimatedSplashScreen
        onFinish={splashGateViewModel.onAnimatedSplashFinish}
      />
    </View>
  );
}

function RootNavigator({
  languageCode,
  startupStatus,
  startupErrorMessage,
  fontsLoaded,
  onRetryStartup,
}: RootNavigatorProps) {
  const { isLoading, hasActiveSession, hasActiveAccount, sessionStatus } =
    useAppRouteSession();

  if (startupStatus === StartupBootstrapStatus.Failed) {
    return (
      <StartupErrorScreen
        message={startupErrorMessage ?? "Unable to initialize app startup."}
        onRetry={onRetryStartup}
      />
    );
  }

  if (!fontsLoaded || startupStatus !== StartupBootstrapStatus.Ready || isLoading) {
    return null;
  }

  const isAuthenticated =
    sessionStatus === AppRouteSessionStatus.Authenticated && hasActiveSession;
  const shouldShowAccountSetup = isAuthenticated && !hasActiveAccount;

  return (
    <Stack
      key={languageCode}
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>

      <Stack.Protected guard={shouldShowAccountSetup}>
        <Stack.Screen name="(account-setup)/select-account" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && hasActiveAccount}>
        <Stack.Screen name="(dashboard)" />
      </Stack.Protected>

      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    InterRegular: require("../assets/fonts/Inter_18pt-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter_18pt-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter_18pt-Bold.ttf"),
  });

  const startupBootstrapViewModel = useStartupBootstrapFactory({
    database: appDatabase,
  });

  const languageCode = useCurrentLanguageCode();

  const fontErrorMessage = React.useMemo(() => {
    if (!fontsError) {
      return null;
    }

    if (fontsError instanceof Error) {
      return fontsError.message;
    }

    return "Unable to load app fonts.";
  }, [fontsError]);

  const startupStatus: StartupBootstrapStatusValue = fontErrorMessage
    ? StartupBootstrapStatus.Failed
    : startupBootstrapViewModel.status;

  const startupErrorMessage =
    fontErrorMessage ?? startupBootstrapViewModel.errorMessage;

  const onRetryStartup = React.useMemo<(() => Promise<void>) | null>(() => {
    if (fontErrorMessage) {
      return null;
    }

    return startupBootstrapViewModel.retry;
  }, [fontErrorMessage, startupBootstrapViewModel.retry]);

  return (
    <SafeAreaProvider style={styles.rootSafeArea}>
      <AppRouteSessionProvider database={appDatabase}>
        <View style={styles.rootContainer}>
          <RootNavigator
            languageCode={languageCode}
            startupStatus={startupStatus}
            startupErrorMessage={startupErrorMessage}
            fontsLoaded={fontsLoaded}
            onRetryStartup={onRetryStartup}
          />

          <StartupOverlayController
            fontsLoaded={fontsLoaded}
            startupStatus={startupStatus}
          />
        </View>
      </AppRouteSessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootSafeArea: {
    flex: 1,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  startupOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
});
