import React, { useEffect } from "react";
import { GetTransactionsScreenFactory } from "@/feature/transactions/factory/getTransactionsScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

export default function PersonalTransactionsDashboardRoute() {
  const navigation = useSmoothNavigation();
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeAccountType,
    activeUserRemoteId,
    activeAccountRemoteId,
  } = useDashboardRouteContext();

  useEffect(() => {
    if (isLoading || !hasActiveSession || !hasActiveAccount) {
      return;
    }

    if (activeAccountType !== AccountType.Personal) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [
    activeAccountType,
    hasActiveAccount,
    hasActiveSession,
    isLoading,
    navigation,
  ]);

  if (isLoading || !hasActiveSession || !hasActiveAccount) {
    return null;
  }

  if (activeAccountType !== AccountType.Personal) {
    return null;
  }

  return (
    <GetTransactionsScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
    />
  );
}
