import React from "react";
import { GetProfileScreenFactory } from "@/feature/profile/screen/factory/getProfileScreen.factory";
import appDatabase from "@/shared/database/appDatabase";
import { useDashboardProfileRouteHandlers } from "@/feature/profile/screen/factory/useDashboardProfileRouteHandlers.factory";

export default function DashboardProfileRoute() {
  const {
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onLogout,
    onBackToHome,
  } = useDashboardProfileRouteHandlers();

  return (
    <GetProfileScreenFactory
      database={appDatabase}
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onNavigateHome={onNavigateHome}
      onLogout={onLogout}
      onBack={onBackToHome}
    />
  );
}
