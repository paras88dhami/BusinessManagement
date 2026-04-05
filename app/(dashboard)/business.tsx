import React, { useCallback } from "react";
import { GetBusinessDashboardScreenFactory } from "@/feature/dashboard/business/factory/getBusinessDashboardScreen.factory";
import { BusinessDashboardQuickAction } from "@/feature/dashboard/business/types/businessDashboard.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { useAccountPermissionAccess } from "@/feature/userManagement/factory/useAccountPermissionAccess.factory";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function BusinessDashboardRoute() {
  const navigation = useSmoothNavigation();
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeUserRemoteId,
    activeAccountRemoteId,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
  } = useDashboardRouteContext();
  const permissionAccess = useAccountPermissionAccess({
    activeUserRemoteId,
    activeAccountRemoteId,
  });

  const hasQuickActionAccess = useCallback(
    (actionId: BusinessDashboardQuickAction["id"]): boolean => {
      if (permissionAccess.isLoading) {
        return true;
      }

      switch (actionId) {
        case "orders":
          return permissionAccess.hasPermission("orders.view");
        case "products":
          return permissionAccess.hasPermission("products.view");
        case "billing":
          return permissionAccess.hasPermission("billing.view");
        case "contacts":
          return permissionAccess.hasPermission("contacts.view");
        default:
          return true;
      }
    },
    [permissionAccess],
  );

  const onQuickActionPress = useCallback(
    (actionId: BusinessDashboardQuickAction["id"]) => {
      switch (actionId) {
        case "orders":
          navigation.push("/(dashboard)/orders");
          return;
        case "products":
          navigation.push("/(dashboard)/products");
          return;
        case "billing":
          navigation.push("/(dashboard)/billing");
          return;
        case "contacts":
          navigation.push("/(dashboard)/contacts");
          return;
        default:
          return;
      }
    },
    [navigation],
  );

  if (isLoading || !hasActiveSession || !hasActiveAccount) {
    return null;
  }

  return (
    <GetBusinessDashboardScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      activeAccountCurrencyCode={activeAccountCurrencyCode}
      activeAccountCountryCode={activeAccountCountryCode}
      hasQuickActionAccess={hasQuickActionAccess}
      onQuickActionPress={onQuickActionPress}
    />
  );
}
