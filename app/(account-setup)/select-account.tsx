import { clearActiveUserSession } from "@/feature/appSettings/data/appSettings.store";
import { GetAccountSelectionScreenFactory } from "@/feature/auth/accountSelection/factory/getAccountSelectionScreen.factory";
import { SelectedAccountContext } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import appDatabase from "@/shared/database/appDatabase";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import React, { useCallback, useEffect } from "react";

export default function SelectAccountRoute() {
  const navigation = useSmoothNavigation();
  const { refreshSession, activeUserRemoteId, activeAccountRemoteId } =
    useAppRouteSession();

  const refreshSessionSafely = useCallback(async (): Promise<void> => {
    try {
      await refreshSession();
    } catch {}
  }, [refreshSession]);

  const handleBackToLogin = useCallback(async () => {
    try {
      await clearActiveUserSession(appDatabase);
      await refreshSessionSafely();
    } catch {}
  }, [refreshSessionSafely]);

  const handleAccountSelected = useCallback(
    async (_selectedAccountContext: SelectedAccountContext): Promise<void> => {
      await refreshSessionSafely();
    },
    [refreshSessionSafely],
  );

  useEffect(() => {
    navigation.prefetch("/(dashboard)/business");
    navigation.prefetch("/(dashboard)/personal");
  }, [navigation]);

  return (
    <GetAccountSelectionScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onBackToLogin={handleBackToLogin}
      onAccountSelected={handleAccountSelected}
    />
  );
}
