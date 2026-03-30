import React from "react";
import {
  DashboardInfoCard,
  DashboardTabScaffold,
} from "@/feature/dashboard/shared/ui/DashboardTabScaffold";

export default function EmiLoansDashboardRoute() {
  return (
    <DashboardTabScaffold>
      <DashboardInfoCard
        title="EMI Tracker"
        description="Track installments, pending dues and payment schedule from this tab for both personal and business modes."
      />
      <DashboardInfoCard
        title="Next"
        description="Connect EMI records, reminders and settlement actions in this route when you build the module."
      />
    </DashboardTabScaffold>
  );
}
