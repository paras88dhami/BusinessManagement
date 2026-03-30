import React from "react";
import {
  DashboardInfoCard,
  DashboardTabScaffold,
} from "@/feature/dashboard/shared/ui/DashboardTabScaffold";

export default function PosDashboardRoute() {
  return (
    <DashboardTabScaffold>
      <DashboardInfoCard
        title="POS Checkout"
        description="Use this tab for quick invoice and checkout flow. Navigation and tab state are fully wired."
      />
      <DashboardInfoCard
        title="Next"
        description="Attach product grid, cart summary and payment actions in this route without changing the tab architecture."
      />
    </DashboardTabScaffold>
  );
}
