import React, { useCallback, useEffect, useState } from "react";
import appDatabase from "@/shared/database/appDatabase";
import { GetAuthEntryScreenFactory } from "@/feature/auth/entry/factory/getAuthEntryScreen.factory";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { warmDatabaseFieldEncryptionKey } from "@/shared/utils/security/databaseFieldEncryption.service";

export default function LoginRoute() {
  const navigation = useSmoothNavigation();
  const { refreshSession, hasActiveSession } = useAppRouteSession();
  const [shouldNavigateToAccountSetup, setShouldNavigateToAccountSetup] =
    useState(false);

  useEffect(() => {
    if (!shouldNavigateToAccountSetup || !hasActiveSession) {
      return;
    }

    setShouldNavigateToAccountSetup(false);
    navigation.replace("/(account-setup)/select-account");
  }, [hasActiveSession, navigation, shouldNavigateToAccountSetup]);

  const handleOnLoginSuccess = useCallback(() => {
    void (async () => {
      setShouldNavigateToAccountSetup(true);
      await refreshSession();
    })();
  }, [refreshSession]);

  const handleOnSignUpSuccess = useCallback(() => {
    void (async () => {
      setShouldNavigateToAccountSetup(true);
      await refreshSession();
    })();
  }, [refreshSession]);

  useEffect(() => {
    void warmDatabaseFieldEncryptionKey().catch(() => {});
    navigation.prefetch("/(account-setup)/select-account");
  }, [navigation]);

  return (
    <GetAuthEntryScreenFactory
      database={appDatabase}
      onLoginSuccess={handleOnLoginSuccess}
      onSignUpSuccess={handleOnSignUpSuccess}
    />
  );
}

