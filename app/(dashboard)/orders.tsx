import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { GetOrdersScreenFactory } from "@/feature/orders/factory/getOrdersScreen.factory";
import { useAccountPermissionAccess } from "@/feature/userManagement/factory/useAccountPermissionAccess.factory";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import React, { useEffect } from "react";

const ORDERS_VIEW_PERMISSION_CODE = "orders.view";
const ORDERS_MANAGE_PERMISSION_CODE = "orders.manage";

export default function OrdersDashboardRoute() {
  const navigation = useSmoothNavigation();
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeUserRemoteId,
    activeAccountRemoteId,
    activeAccountType,
    activeAccountDisplayName,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
  } = useDashboardRouteContext();

  const permissionAccess = useAccountPermissionAccess({
    activeUserRemoteId,
    activeAccountRemoteId,
  });

  const canViewOrders = permissionAccess.hasPermission(ORDERS_VIEW_PERMISSION_CODE);
  const canManageOrders = permissionAccess.hasPermission(ORDERS_MANAGE_PERMISSION_CODE);

  useEffect(() => {
    if (isLoading || !hasActiveSession || !hasActiveAccount) {
      return;
    }

    if (activeAccountType !== AccountType.Business) {
      navigation.replace(getDashboardHomePath(activeAccountType));
      return;
    }

    if (permissionAccess.isLoading) {
      return;
    }

    if (!canViewOrders) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [
    activeAccountType,
    canViewOrders,
    hasActiveAccount,
    hasActiveSession,
    isLoading,
    navigation,
    permissionAccess.isLoading,
  ]);

  if (
    isLoading ||
    !hasActiveSession ||
    !hasActiveAccount ||
    permissionAccess.isLoading
  ) {
    return null;
  }

  if (activeAccountType !== AccountType.Business || !canViewOrders) {
    return null;
  }

  return (
    <GetOrdersScreenFactory
      activeAccountRemoteId={activeAccountRemoteId}
      activeUserRemoteId={activeUserRemoteId}
      activeAccountDisplayName={activeAccountDisplayName}
      activeAccountCurrencyCode={activeAccountCurrencyCode}
      activeAccountCountryCode={activeAccountCountryCode}
      canManage={canManageOrders}
    />
  );
}
