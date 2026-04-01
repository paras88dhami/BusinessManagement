import React from "react";
import { Database } from "@nozbe/watermelondb";
import { SelectedAccountContext } from "../types/accountSelection.types";
import { createLocalAccountDatasource } from "../data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "../data/repository/account.repository.impl";
import { createGetAccountsByOwnerUserRemoteIdUseCase } from "../useCase/getAccountsByOwnerUserRemoteId.useCase.impl";
import { useAccountSelectionViewModel } from "../viewModel/accountSelection.viewModel.impl";
import { AccountSelectionScreen } from "../ui/AccountSelectionScreen";

type GetAccountSelectionScreenFactoryProps = {
  database: Database;
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onBackToLogin: () => void;
  onAccountSelected?: (
    selectedAccountContext: SelectedAccountContext,
  ) => Promise<void> | void;
};

export function GetAccountSelectionScreenFactory({
  database,
  activeUserRemoteId,
  activeAccountRemoteId,
  onBackToLogin,
  onAccountSelected,
}: GetAccountSelectionScreenFactoryProps) {
  const accountDatasource = React.useMemo(
    () => createLocalAccountDatasource(database),
    [database],
  );

  const accountRepository = React.useMemo(
    () => createAccountRepository(accountDatasource),
    [accountDatasource],
  );

  const getAccountsByOwnerUserRemoteIdUseCase = React.useMemo(
    () => createGetAccountsByOwnerUserRemoteIdUseCase(accountRepository),
    [accountRepository],
  );

  const viewModel = useAccountSelectionViewModel({
    database,
    activeUserRemoteId,
    activeAccountRemoteId,
    getAccountsByOwnerUserRemoteIdUseCase,
    onBackToLogin,
    onAccountSelected,
  });

  return <AccountSelectionScreen viewModel={viewModel} />;
}
