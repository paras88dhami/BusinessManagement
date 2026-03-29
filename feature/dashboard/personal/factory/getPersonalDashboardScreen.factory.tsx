import React from "react";
import { usePersonalDashboardViewModel } from "../viewModel/personalDashboard.viewModel.impl";
import { PersonalDashboardScreen } from "../ui/PersonalDashboardScreen";

type GetPersonalDashboardScreenFactoryProps = {
  onSwitchAccount: () => void;
  onLogout: () => void;
};

export function GetPersonalDashboardScreenFactory({
  onSwitchAccount,
  onLogout,
}: GetPersonalDashboardScreenFactoryProps) {
  const viewModel = usePersonalDashboardViewModel({
    onSwitchAccount,
    onLogout,
  });

  return <PersonalDashboardScreen viewModel={viewModel} />;
}
