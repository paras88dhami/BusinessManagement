import React, { useCallback, useEffect } from "react";
import appDatabase from "@/shared/database/appDatabase";
import {
  clearActiveUserSession,
} from "@/feature/appSettings/data/appSettings.store";
import {
  SelectedAccountContext,
} from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { GetAccountSelectionScreenFactory } from "@/feature/setting/accounts/accountSelection/factory/getAccountSelectionScreen.factory";

export default function SelectAccountRoute() {
  const navigation = useSmoothNavigation();
  const {
    refreshSession,
    activeUserRemoteId,
    activeAccountRemoteId,
  } = useAppRouteSession();

  const handleBackToLogin = useCallback(async () => {
    try {
      await clearActiveUserSession(appDatabase);
      await refreshSession();
    } catch (error) {
      console.error("Failed to clear session and return to login.", error);
    }
  }, [refreshSession]);

  const handleAccountSelected = useCallback(
    async (_selectedAccountContext: SelectedAccountContext) => {
      try {
        await refreshSession();
      } catch (error) {
        console.error("Failed to refresh session after account selection.", error);
      }
    },
    [refreshSession],
  );

  useEffect(() => {
    navigation.prefetch("/(dashboard)/business");
    navigation.prefetch("/(dashboard)/personal");
  }, [navigation]);

  return (
    <GetAccountSelectionScreenFactory
      database={appDatabase}
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onBackToLogin={handleBackToLogin}
      onAccountSelected={handleAccountSelected}
    />
  );
}

