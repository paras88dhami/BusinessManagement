import React from "react";
import { Redirect } from "expo-router";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";

export default function IndexRoute() {
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeAccountType,
  } = useAppRouteSession();

  if (isLoading) {
    return null;
  }

  if (!hasActiveSession) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasActiveAccount) {
    return <Redirect href="/(account-setup)/select-account" />;
  }

  return <Redirect href={getDashboardHomePath(activeAccountType)} />;
}
