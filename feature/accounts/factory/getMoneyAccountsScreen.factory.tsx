import React from "react";
import appDatabase from "@/shared/database/appDatabase";
import { createLocalMoneyAccountDatasource } from "@/feature/accounts/data/dataSource/local.moneyAccount.datasource.impl";
import { createMoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository.impl";
import { createGetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase.impl";
import { createSaveMoneyAccountUseCase } from "@/feature/accounts/useCase/saveMoneyAccount.useCase.impl";
import { createArchiveMoneyAccountUseCase } from "@/feature/accounts/useCase/archiveMoneyAccount.useCase.impl";
import { createAdjustMoneyAccountBalanceUseCase } from "@/feature/accounts/useCase/adjustMoneyAccountBalance.useCase.impl";
import { useMoneyAccountsViewModel } from "@/feature/accounts/viewModel/moneyAccounts.viewModel.impl";
import { MoneyAccountsScreen } from "@/feature/accounts/ui/MoneyAccountsScreen";
import { createLocalMoneyPostingDatasource } from "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl";
import { createMoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository.impl";
import { createPostMoneyMovementUseCase } from "@/feature/transactions/useCase/postMoneyMovement.useCase.impl";

type GetMoneyAccountsScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountDisplayName: string;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  canManage: boolean;
  onOpenAccountHistory: (
    moneyAccountRemoteId: string,
    moneyAccountName: string,
  ) => void;
};

export function GetMoneyAccountsScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  activeAccountDisplayName,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  canManage,
  onOpenAccountHistory,
}: GetMoneyAccountsScreenFactoryProps): React.ReactElement {
  const datasource = React.useMemo(
    () => createLocalMoneyAccountDatasource(appDatabase),
    [],
  );

  const repository = React.useMemo(
    () => createMoneyAccountRepository(datasource),
    [datasource],
  );

  const getMoneyAccountsUseCase = React.useMemo(
    () => createGetMoneyAccountsUseCase(repository),
    [repository],
  );

  const moneyPostingDatasource = React.useMemo(
    () => createLocalMoneyPostingDatasource(appDatabase),
    [],
  );
  const moneyPostingRepository = React.useMemo(
    () => createMoneyPostingRepository(moneyPostingDatasource),
    [moneyPostingDatasource],
  );
  const postMoneyMovementUseCase = React.useMemo(
    () => createPostMoneyMovementUseCase(moneyPostingRepository),
    [moneyPostingRepository],
  );
  const saveMoneyAccountUseCase = React.useMemo(
    () =>
      createSaveMoneyAccountUseCase({
        repository,
        postMoneyMovementUseCase,
      }),
    [postMoneyMovementUseCase, repository],
  );
  const archiveMoneyAccountUseCase = React.useMemo(
    () => createArchiveMoneyAccountUseCase(repository),
    [repository],
  );
  const adjustMoneyAccountBalanceUseCase = React.useMemo(
    () =>
      createAdjustMoneyAccountBalanceUseCase({
        moneyAccountRepository: repository,
        postMoneyMovementUseCase,
      }),
    [postMoneyMovementUseCase, repository],
  );

  const viewModel = useMoneyAccountsViewModel({
    activeUserRemoteId,
    scopeAccountRemoteId: activeAccountRemoteId,
    scopeAccountDisplayName: activeAccountDisplayName,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
    canManage,
    getMoneyAccountsUseCase,
    saveMoneyAccountUseCase,
    archiveMoneyAccountUseCase,
    adjustMoneyAccountBalanceUseCase,
    onOpenAccountHistory,
  });

  return <MoneyAccountsScreen viewModel={viewModel} />;
}
