import React from "react";
import {
  DashboardInfoCard,
  DashboardTabScaffold,
} from "@/feature/dashboard/shared/ui/DashboardTabScaffold";

export default function PersonalTransactionsDashboardRoute() {
  return (
    <DashboardTabScaffold>
      <DashboardInfoCard
        title="Personal Transactions"
        description="Track personal income and expenses with date filters and category-wise summaries in this tab."
      />
      <DashboardInfoCard
        title="Next"
        description="Attach your transaction list and add-transaction flow to this route for personal mode."
      />
    </DashboardTabScaffold>
  );
}
