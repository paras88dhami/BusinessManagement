import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useProfileScreenDependencies } from "@/feature/profile/screen/factory/useProfileScreenDependencies.factory";
import { BusinessDetailsScreen } from "@/feature/profile/screen/ui/BusinessDetailsScreen";
import { useProfileScreenViewModel } from "@/feature/profile/screen/viewModel/profileScreen.viewModel.impl";
import appDatabase from "@/shared/database/appDatabase";
import React from "react";

type GetBusinessDetailsScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onLogout: () => Promise<void>;
  onBack: () => void;
};

export function GetBusinessDetailsScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  onNavigateHome,
  onLogout,
  onBack,
}: GetBusinessDetailsScreenFactoryProps) {
  const dependencies = useProfileScreenDependencies(appDatabase);

  const viewModel = useProfileScreenViewModel({
    dependencies,
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome,
    onOpenSettings: () => {},
    onLogout,
    onBack,
  });

  return <BusinessDetailsScreen viewModel={viewModel} />;
}
