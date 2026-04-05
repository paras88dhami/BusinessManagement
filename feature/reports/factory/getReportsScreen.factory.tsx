import React from "react";
import { Database } from "@nozbe/watermelondb";
import { createLocalReportsDatasource } from "@/feature/reports/data/dataSource/local.reports.datasource.impl";
import { createReportsRepository } from "@/feature/reports/data/repository/reports.repository.impl";
import { createGetReportsDashboardUseCase } from "@/feature/reports/useCase/getReportsDashboard.useCase.impl";
import { createGetReportDetailUseCase } from "@/feature/reports/useCase/getReportDetail.useCase.impl";
import { useReportsViewModel } from "@/feature/reports/viewModel/reports.viewModel.impl";
import { ReportsScreen } from "@/feature/reports/ui/ReportsScreen";
import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";

type Props = {
  database: Database;
  accountType: AccountTypeValue;
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
};

export function GetReportsScreenFactory({
  database,
  accountType,
  ownerUserRemoteId,
  accountRemoteId,
}: Props) {
  const datasource = React.useMemo(() => createLocalReportsDatasource(database), [database]);
  const repository = React.useMemo(() => createReportsRepository(datasource), [datasource]);
  const getReportsDashboardUseCase = React.useMemo(
    () => createGetReportsDashboardUseCase(repository),
    [repository],
  );
  const getReportDetailUseCase = React.useMemo(
    () => createGetReportDetailUseCase(repository),
    [repository],
  );

  const viewModel = useReportsViewModel({
    accountType,
    ownerUserRemoteId,
    accountRemoteId,
    getReportsDashboardUseCase,
    getReportDetailUseCase,
  });

  return <ReportsScreen viewModel={viewModel} />;
}
