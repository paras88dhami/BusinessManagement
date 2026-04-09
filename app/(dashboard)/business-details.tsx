import React from "react";
import { GetBusinessDetailsScreenFactory } from "@/feature/profile/screen/factory/getBusinessDetailsScreen.factory";
import { useDashboardProfileRouteHandlers } from "@/feature/profile/screen/factory/useDashboardProfileRouteHandlers.factory";

export default function DashboardBusinessDetailsRoute() {
  const {
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onBackToHome,
  } = useDashboardProfileRouteHandlers();

  return (
    <GetBusinessDetailsScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onNavigateHome={onNavigateHome}
      onBack={onBackToHome}
    />
  );
}
