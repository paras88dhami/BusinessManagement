import React, { useCallback, useEffect, useState } from "react";
import appDatabase from "@/shared/database/appDatabase";
import {
  clearActiveUserSession,
} from "@/feature/appSettings/data/appSettings.store";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import {
  AccountTypeValue,
  SelectedAccountContext,
} from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { GetAccountSelectionScreenFactory } from "@/feature/setting/accounts/accountSelection/factory/getAccountSelectionScreen.factory";

export default function SelectAccountRoute() {
  const navigation = useSmoothNavigation();
  const {
    refreshSession,
    hasActiveSession,
    hasActiveAccount,
    activeAccountType,
  } = useAppRouteSession();
  const [pendingSelectedAccountType, setPendingSelectedAccountType] =
    useState<AccountTypeValue | null>(null);
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false);

  useEffect(() => {
    if (!isNavigatingToLogin || hasActiveSession) {
      return;
    }

    setIsNavigatingToLogin(false);
    navigation.replace("/(auth)/login");
  }, [hasActiveSession, isNavigatingToLogin, navigation]);

  useEffect(() => {
    if (!pendingSelectedAccountType) {
      return;
    }

    if (!hasActiveAccount || activeAccountType !== pendingSelectedAccountType) {
      return;
    }

    setPendingSelectedAccountType(null);
    navigation.replace(getDashboardHomePath(pendingSelectedAccountType));
  }, [
    activeAccountType,
    hasActiveAccount,
    navigation,
    pendingSelectedAccountType,
  ]);

  const handleBackToLogin = useCallback(async () => {
    try {
      setIsNavigatingToLogin(true);
      await clearActiveUserSession(appDatabase);
      await refreshSession();
    } catch {
      setIsNavigatingToLogin(false);
      // Keep user on this screen if session clear fails.
    }
  }, [refreshSession]);

  const handleAccountSelected = useCallback(
    async (selectedAccountContext: SelectedAccountContext) => {
      setPendingSelectedAccountType(selectedAccountContext.accountType);
      await refreshSession();
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
      onBackToLogin={handleBackToLogin}
      onAccountSelected={handleAccountSelected}
    />
  );
}

