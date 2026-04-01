import React from "react";
import { usePersonalDashboardViewModel } from "../viewModel/personalDashboard.viewModel.impl";
import { PersonalDashboardScreen } from "../ui/PersonalDashboardScreen";

export function GetPersonalDashboardScreenFactory() {
  const viewModel = usePersonalDashboardViewModel();

  return <PersonalDashboardScreen viewModel={viewModel} />;
}
