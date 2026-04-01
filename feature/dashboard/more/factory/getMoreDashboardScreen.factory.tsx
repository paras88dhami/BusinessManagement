import React from "react";
import { useMoreDashboardViewModel } from "../viewModel/moreDashboard.viewModel.impl";
import { MoreDashboardScreen } from "../ui/MoreDashboardScreen";

type GetMoreDashboardScreenFactoryProps = {
  isBusinessMode: boolean;
  onOpenProfile: () => void;
  onOpenLedger: () => void;
  onOpenPos: () => void;
  onOpenEmi: () => void;
  onOpenTransactions: () => void;
  onOpenBudget: () => void;
};

export function GetMoreDashboardScreenFactory({
  isBusinessMode,
  onOpenProfile,
  onOpenLedger,
  onOpenPos,
  onOpenEmi,
  onOpenTransactions,
  onOpenBudget,
}: GetMoreDashboardScreenFactoryProps) {
  const viewModel = useMoreDashboardViewModel({
    isBusinessMode,
    onOpenProfile,
    onOpenLedger,
    onOpenPos,
    onOpenEmi,
    onOpenTransactions,
    onOpenBudget,
  });

  return <MoreDashboardScreen viewModel={viewModel} />;
}
