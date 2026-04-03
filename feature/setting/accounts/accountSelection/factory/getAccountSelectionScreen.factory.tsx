import React from "react";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createLocalUserManagementDatasource } from "@/feature/setting/accounts/userManagement/data/dataSource/local.userManagement.datasource.impl";
import { createUserManagementRepository } from "@/feature/setting/accounts/userManagement/data/repository/userManagement.repository.impl";
import { SelectedAccountContext } from "../types/accountSelection.types";
import { createLocalAccountDatasource } from "../data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "../data/repository/account.repository.impl";
import { createGetAccessibleAccountsByUserRemoteIdUseCase } from "../useCase/getAccessibleAccountsByUserRemoteId.useCase.impl";
import { useAccountSelectionViewModel } from "../viewModel/accountSelection.viewModel.impl";
import { AccountSelectionScreen } from "../ui/AccountSelectionScreen";
import appDatabase from "@/shared/database/appDatabase";

type GetAccountSelectionScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onBackToLogin: () => void;
  onAccountSelected: (
    selectedAccountContext: SelectedAccountContext,
  ) => Promise<void> | void;
};

export function GetAccountSelectionScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  onBackToLogin,
  onAccountSelected,
}: GetAccountSelectionScreenFactoryProps) {
  const accountDatasource = React.useMemo(
    () => createLocalAccountDatasource(appDatabase),
    [],
  );

  const accountRepository = React.useMemo(
    () => createAccountRepository(accountDatasource),
    [accountDatasource],
  );

  const authUserDatasource = React.useMemo(
    () => createLocalAuthUserDatasource(appDatabase),
    [],
  );

  const authUserRepository = React.useMemo(
    () => createAuthUserRepository(authUserDatasource),
    [authUserDatasource],
  );

  const userManagementDatasource = React.useMemo(
    () => createLocalUserManagementDatasource(appDatabase),
    [],
  );

  const userManagementRepository = React.useMemo(
    () =>
      createUserManagementRepository({
        localDatasource: userManagementDatasource,
        accountRepository,
        authUserRepository,
      }),
    [accountRepository, authUserRepository, userManagementDatasource],
  );

  const getAccessibleAccountsByUserRemoteIdUseCase = React.useMemo(
    () =>
      createGetAccessibleAccountsByUserRemoteIdUseCase({
        accountRepository,
        userManagementRepository,
      }),
    [accountRepository, userManagementRepository],
  );

  const viewModel = useAccountSelectionViewModel({
    database: appDatabase,
    activeUserRemoteId,
    activeAccountRemoteId,
    getAccessibleAccountsByUserRemoteIdUseCase,
    onBackToLogin,
    onAccountSelected,
  });

  return <AccountSelectionScreen viewModel={viewModel} />;
}
