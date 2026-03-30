import React from "react";
import { Database } from "@nozbe/watermelondb";
import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useDashboardProfileViewModel } from "../viewModel/profile.viewModel.impl";
import { DashboardProfileScreen } from "../ui/ProfileDashboardScreen";

type GetDashboardProfileScreenFactoryProps = {
  database: Database;
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onSwitchAccountViaSelector: () => void;
  onLogout: () => Promise<void>;
  onBack: () => void;
};

export function GetDashboardProfileScreenFactory({
  database,
  activeUserRemoteId,
  activeAccountRemoteId,
  onNavigateHome,
  onSwitchAccountViaSelector,
  onLogout,
  onBack,
}: GetDashboardProfileScreenFactoryProps) {
  const viewModel = useDashboardProfileViewModel({
    database,
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onSwitchAccountViaSelector,
    onLogout,
    onBack,
  });

  return <DashboardProfileScreen viewModel={viewModel} />;
}
