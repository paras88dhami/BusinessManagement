import React from "react";
import appDatabase from "@/shared/database/appDatabase";
import { createLocalLedgerDatasource } from "@/feature/ledger/data/dataSource/local.ledger.datasource.impl";
import { createLedgerRepository } from "@/feature/ledger/data/repository/ledger.repository.impl";
import { createGetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase.impl";
import { createLocalTransactionDatasource } from "@/feature/transactions/data/dataSource/local.transaction.datasource.impl";
import { createTransactionRepository } from "@/feature/transactions/data/repository/transaction.repository.impl";
import { createGetTransactionsUseCase } from "@/feature/transactions/useCase/getTransactions.useCase.impl";
import { createGetBusinessDashboardReadModelUseCase } from "../readModel/useCase/getBusinessDashboardReadModel.useCase.impl";
import { useBusinessDashboardViewModel } from "../viewModel/businessDashboard.viewModel.impl";
import { BusinessDashboardScreen } from "../ui/BusinessDashboardScreen";
import { BusinessDashboardQuickAction } from "../types/businessDashboard.types";

type GetBusinessDashboardScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  hasQuickActionAccess: (actionId: BusinessDashboardQuickAction["id"]) => boolean;
  onQuickActionPress: (actionId: BusinessDashboardQuickAction["id"]) => void;
};

export function GetBusinessDashboardScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  hasQuickActionAccess,
  onQuickActionPress,
}: GetBusinessDashboardScreenFactoryProps) {
  const transactionDatasource = React.useMemo(
    () => createLocalTransactionDatasource(appDatabase),
    [],
  );

  const transactionRepository = React.useMemo(
    () => createTransactionRepository(transactionDatasource),
    [transactionDatasource],
  );

  const getTransactionsUseCase = React.useMemo(
    () => createGetTransactionsUseCase(transactionRepository),
    [transactionRepository],
  );

  const ledgerDatasource = React.useMemo(
    () => createLocalLedgerDatasource(appDatabase),
    [],
  );

  const ledgerRepository = React.useMemo(
    () => createLedgerRepository(ledgerDatasource),
    [ledgerDatasource],
  );

  const getLedgerEntriesUseCase = React.useMemo(
    () => createGetLedgerEntriesUseCase(ledgerRepository),
    [ledgerRepository],
  );

  const getBusinessDashboardReadModelUseCase = React.useMemo(
    () =>
      createGetBusinessDashboardReadModelUseCase({
        getTransactionsUseCase,
        getLedgerEntriesUseCase,
      }),
    [getLedgerEntriesUseCase, getTransactionsUseCase],
  );

  const viewModel = useBusinessDashboardViewModel({
    activeUserRemoteId,
    activeAccountRemoteId,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
    hasQuickActionAccess,
    onQuickActionPress,
    getBusinessDashboardReadModelUseCase,
  });

  return <BusinessDashboardScreen viewModel={viewModel} />;
}
