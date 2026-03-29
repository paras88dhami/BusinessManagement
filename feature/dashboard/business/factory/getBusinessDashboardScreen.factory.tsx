import React from "react";
import { useBusinessDashboardViewModel } from "../viewModel/businessDashboard.viewModel.impl";
import { BusinessDashboardScreen } from "../ui/BusinessDashboardScreen";

type GetBusinessDashboardScreenFactoryProps = {
  onSwitchAccount: () => void;
  onLogout: () => void;
};

export function GetBusinessDashboardScreenFactory({
  onSwitchAccount,
  onLogout,
}: GetBusinessDashboardScreenFactoryProps) {
  const viewModel = useBusinessDashboardViewModel({
    onSwitchAccount,
    onLogout,
  });

  return <BusinessDashboardScreen viewModel={viewModel} />;
}
