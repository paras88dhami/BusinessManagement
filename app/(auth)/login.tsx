import React, { useCallback, useEffect } from "react";
import appDatabase from "@/shared/database/appDatabase";
import { GetAuthEntryScreenFactory } from "@/feature/auth/entry/factory/getAuthEntryScreen.factory";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { warmDatabaseFieldEncryptionKey } from "@/shared/utils/security/databaseFieldEncryption.service";

export default function LoginRoute() {
  const navigation = useSmoothNavigation();
  const { refreshSession } = useAppRouteSession();

  const handleOnLoginSuccess = useCallback(() => {
    void refreshSession().catch((error) => {
      console.error("Failed to refresh session after login.", error);
    });
  }, [refreshSession]);

  const handleOnSignUpSuccess = useCallback(() => {
    void refreshSession().catch((error) => {
      console.error("Failed to refresh session after sign up.", error);
    });
  }, [refreshSession]);

  useEffect(() => {
    void warmDatabaseFieldEncryptionKey().catch((error) => {
      console.error("Failed to warm database encryption key.", error);
    });

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

