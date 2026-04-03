import React from "react";
import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useProfileScreenViewModel } from "@/feature/profile/screen/viewModel/profileScreen.viewModel.impl";
import { ProfileScreen } from "@/feature/profile/screen/ui/ProfileScreen";
import { useProfileScreenDependencies } from "@/feature/profile/screen/factory/useProfileScreenDependencies.factory";
import appDatabase from "@/shared/database/appDatabase";

type GetProfileScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onLogout: () => Promise<void>;
  onBack: () => void;
};

export function GetProfileScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  onNavigateHome,
  onLogout,
  onBack,
}: GetProfileScreenFactoryProps) {
  const dependencies = useProfileScreenDependencies(appDatabase);

  const viewModel = useProfileScreenViewModel({
    dependencies,
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onLogout,
    onBack,
  });

  return <ProfileScreen viewModel={viewModel} />;
}
