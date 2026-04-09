import React from "react";
import { GetProfileScreenFactory } from "@/feature/profile/screen/factory/getProfileScreen.factory";
import { useDashboardProfileRouteHandlers } from "@/feature/profile/screen/factory/useDashboardProfileRouteHandlers.factory";

export default function DashboardProfileRoute() {
  const {
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onBackToHome,
  } = useDashboardProfileRouteHandlers();

  return (
    <GetProfileScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onNavigateHome={onNavigateHome}
      onBack={onBackToHome}
    />
  );
}
