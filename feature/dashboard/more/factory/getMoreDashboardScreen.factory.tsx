import React from "react";
import { useMoreDashboardViewModel } from "../viewModel/moreDashboard.viewModel.impl";
import { MoreDashboardScreen } from "../ui/MoreDashboardScreen";
import { MoreDashboardMenuAccessPredicate } from "../types/moreDashboard.types";

type GetMoreDashboardScreenFactoryProps = {
  isBusinessMode: boolean;
  onOpenProfile: () => void;
  onOpenLedger: () => void;
  onOpenPos: () => void;
  onOpenEmi: () => void;
  onOpenTransactions: () => void;
  onOpenBudget: () => void;
  onOpenUserManagement: () => void;
  hasMenuAccess?: MoreDashboardMenuAccessPredicate;
};

export function GetMoreDashboardScreenFactory({
  isBusinessMode,
  onOpenProfile,
  onOpenLedger,
  onOpenPos,
  onOpenEmi,
  onOpenTransactions,
  onOpenBudget,
  onOpenUserManagement,
  hasMenuAccess,
}: GetMoreDashboardScreenFactoryProps) {
  const viewModel = useMoreDashboardViewModel({
    isBusinessMode,
    onOpenProfile,
    onOpenLedger,
    onOpenPos,
    onOpenEmi,
    onOpenTransactions,
    onOpenBudget,
    onOpenUserManagement,
    hasMenuAccess,
  });

  return <MoreDashboardScreen viewModel={viewModel} />;
}
