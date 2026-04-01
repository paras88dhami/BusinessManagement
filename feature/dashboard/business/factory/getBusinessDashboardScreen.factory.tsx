import React from "react";
import { useBusinessDashboardViewModel } from "../viewModel/businessDashboard.viewModel.impl";
import { BusinessDashboardScreen } from "../ui/BusinessDashboardScreen";

export function GetBusinessDashboardScreenFactory() {
  const viewModel = useBusinessDashboardViewModel();

  return <BusinessDashboardScreen viewModel={viewModel} />;
}
