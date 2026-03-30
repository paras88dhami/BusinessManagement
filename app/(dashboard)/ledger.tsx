import React from "react";
import {
  DashboardInfoCard,
  DashboardTabScaffold,
} from "@/feature/dashboard/shared/ui/DashboardTabScaffold";

export default function LedgerDashboardRoute() {
  return (
    <DashboardTabScaffold>
      <DashboardInfoCard
        title="Ledger Overview"
        description="Track payable and receivable balances here. This tab is ready for ledger list and party-level balances."
      />
      <DashboardInfoCard
        title="Next"
        description="Hook this page with party ledger entries and due-date filters to match your final production flow."
      />
    </DashboardTabScaffold>
  );
}
