import React, { useCallback, useEffect } from "react";
import { GetAuthEntryScreenFactory } from "@/feature/auth/entry/factory/getAuthEntryScreen.factory";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { warmDatabaseFieldEncryptionKey } from "@/shared/utils/security/databaseFieldEncryption.service";

export default function LoginRoute() {
  const navigation = useSmoothNavigation();
  const { refreshSession } = useAppRouteSession();

  const refreshSessionSafely = useCallback(async (): Promise<void> => {
    try {
      await refreshSession();
    } catch {}
  }, [refreshSession]);

  const handleOnLoginSuccess = useCallback((): void => {
    void refreshSessionSafely();
  }, [refreshSessionSafely]);

  const handleOnSignUpSuccess = useCallback((): void => {
    void refreshSessionSafely();
  }, [refreshSessionSafely]);

  const handleForgotPasswordPress = useCallback((): void => {}, []);

  useEffect(() => {
    void warmDatabaseFieldEncryptionKey().catch(() => {});

    navigation.prefetch("/(account-setup)/select-account");
  }, [navigation]);

  return (
    <GetAuthEntryScreenFactory
      onLoginSuccess={handleOnLoginSuccess}
      onSignUpSuccess={handleOnSignUpSuccess}
      onForgotPasswordPress={handleForgotPasswordPress}
      isForgotPasswordEnabled={false}
    />
  );
}

