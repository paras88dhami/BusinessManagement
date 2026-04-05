import React, { useCallback } from "react";
import { GetPersonalDashboardScreenFactory } from "@/feature/dashboard/personal/factory/getPersonalDashboardScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { PersonalDashboardQuickAction } from "@/feature/dashboard/personal/types/personalDashboard.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function PersonalDashboardRoute() {
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
  const onQuickActionPress = useCallback(
    (actionId: PersonalDashboardQuickAction["id"]) => {
      switch (actionId) {
        case "transactions":
          navigation.push("/(dashboard)/personal-transactions");
          return;
        case "emi":
          navigation.push("/(dashboard)/emi-loans");
          return;
        case "budget":
          navigation.push("/(dashboard)/personal-budget");
          return;
        case "notes":
          navigation.push("/(dashboard)/notes");
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
    <GetPersonalDashboardScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      activeAccountCurrencyCode={activeAccountCurrencyCode}
      activeAccountCountryCode={activeAccountCountryCode}
      onQuickActionPress={onQuickActionPress}
    />
  );
}
