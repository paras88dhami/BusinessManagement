import React from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import appDatabase from "@/shared/database/appDatabase";
import {
  AppRouteSessionProvider,
  useAppRouteSession,
} from "@/feature/session/ui/AppRouteSessionProvider";
import { colors } from "@/shared/components/theme/colors";
import { bootstrapSelectedLanguage } from "@/shared/i18n/resources/bootstrapSelectedLanguage";
import { useCurrentLanguageCode } from "@/shared/i18n/resources";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore duplicate call races in development.
});

type RootNavigatorProps = {
  languageCode: string;
  isLanguageReady: boolean;
};

type SplashScreenControllerProps = {
  isLanguageReady: boolean;
};

function SplashScreenController({ isLanguageReady }: SplashScreenControllerProps) {
  const { isLoading } = useAppRouteSession();

  React.useEffect(() => {
    if (!isLanguageReady || isLoading) {
      return;
    }

    void SplashScreen.hideAsync().catch(() => {
      // Ignore hide errors and continue rendering app content.
    });
  }, [isLanguageReady, isLoading]);

  return null;
}

function RootNavigator({ languageCode, isLanguageReady }: RootNavigatorProps) {
  const { isLoading, hasActiveSession, hasActiveAccount } = useAppRouteSession();

  if (!isLanguageReady || isLoading) {
    return null;
  }

  return (
    <Stack
      key={languageCode}
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!hasActiveSession}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveSession}>
        <Stack.Screen name="(account-setup)/select-account" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveSession && hasActiveAccount}>
        <Stack.Screen name="(dashboard)" />
      </Stack.Protected>

      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  const [isLanguageReady, setIsLanguageReady] = React.useState(false);
  const languageCode = useCurrentLanguageCode();

  React.useEffect(() => {
    let isMounted = true;

    const bootstrapLanguage = async (): Promise<void> => {
      try {
        await bootstrapSelectedLanguage();
      } finally {
        if (isMounted) {
          setIsLanguageReady(true);
        }
      }
    };

    void bootstrapLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AppRouteSessionProvider database={appDatabase}>
        <SplashScreenController isLanguageReady={isLanguageReady} />
        <RootNavigator
          languageCode={languageCode}
          isLanguageReady={isLanguageReady}
        />
      </AppRouteSessionProvider>
    </SafeAreaProvider>
  );
}
