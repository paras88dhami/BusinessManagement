import React, { useEffect } from "react";
import { GetProductsScreenFactory } from "@/feature/products/factory/getProductsScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

export default function ProductsDashboardRoute() {
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

    if (activeAccountType !== AccountType.Business) {
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

  if (activeAccountType !== AccountType.Business) {
    return null;
  }

  return (
    <GetProductsScreenFactory
      activeAccountRemoteId={activeAccountRemoteId}
      activeUserRemoteId={activeUserRemoteId}
    />
  );
}
