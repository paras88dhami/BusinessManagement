import React, { useCallback } from "react";
import { GetSettingsScreenFactory } from "@/feature/appSettings/settings/factory/getSettingsScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function SettingsDashboardRoute() {
  const navigation = useSmoothNavigation();
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeUserRemoteId,
  } = useDashboardRouteContext();

  const handleBack = useCallback(() => {
    navigation.replace("/(dashboard)/profile");
  }, [navigation]);

  if (isLoading || !hasActiveSession || !hasActiveAccount) {
    return null;
  }

  return (
    <GetSettingsScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      onBack={handleBack}
    />
  );
}
