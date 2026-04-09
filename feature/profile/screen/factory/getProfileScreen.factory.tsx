import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useProfileScreenDependencies } from "@/feature/profile/screen/factory/useProfileScreenDependencies.factory";
import { ProfileScreen } from "@/feature/profile/screen/ui/ProfileScreen";
import { useProfileScreenViewModel } from "@/feature/profile/screen/viewModel/profileScreen.viewModel.impl";
import appDatabase from "@/shared/database/appDatabase";
import React from "react";

type GetProfileScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onBack: () => void;
};

export function GetProfileScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  onNavigateHome,
  onBack,
}: GetProfileScreenFactoryProps) {
  const dependencies = useProfileScreenDependencies(appDatabase);

  const viewModel = useProfileScreenViewModel({
    dependencies,
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onBack,
  });

  return <ProfileScreen viewModel={viewModel} />;
}
