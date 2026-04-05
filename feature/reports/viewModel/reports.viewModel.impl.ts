import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import {
  ReportHomeTab,
  ReportPeriod,
  ReportQuery,
  ReportScope,
} from "@/feature/reports/types/report.entity.types";
import { ReportsViewState } from "@/feature/reports/types/report.state.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReportsViewModel,
  UseReportsViewModelParams,
} from "./reports.viewModel";

const buildQuery = (params: {
  accountType: UseReportsViewModelParams["accountType"];
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
  period: ReportQuery["period"];
  reportId?: ReportQuery["reportId"];
}): ReportQuery => ({
  accountType: params.accountType,
  scope:
    params.accountType === AccountType.Business
      ? ReportScope.Business
      : ReportScope.Personal,
  ownerUserRemoteId: params.ownerUserRemoteId,
  accountRemoteId: params.accountRemoteId,
  period: params.period,
  reportId: params.reportId ?? null,
});

export const useReportsViewModel = (
  params: UseReportsViewModelParams,
): ReportsViewModel => {
  const {
    accountType,
    ownerUserRemoteId,
    accountRemoteId,
    getReportsDashboardUseCase,
    getReportDetailUseCase,
  } = params;

  const [state, setState] = useState<ReportsViewState>({
    isLoading: true,
    errorMessage: null,
    activeHomeTab: ReportHomeTab.Overview,
    activePeriod: ReportPeriod.ThisMonth,
    dashboard: null,
    selectedReportId: null,
    detail: null,
  });

  const loadDashboard = useCallback(
    async (period: ReportQuery["period"]) => {
      setState((current) => ({ ...current, isLoading: true, errorMessage: null }));
      const result = await getReportsDashboardUseCase.execute(
        buildQuery({
          accountType,
          ownerUserRemoteId,
          accountRemoteId,
          period,
        }),
      );

      if (!result.success) {
        setState((current) => ({
          ...current,
          isLoading: false,
          errorMessage: result.error.message,
        }));
        return;
      }

      setState((current) => ({
        ...current,
        isLoading: false,
        errorMessage: null,
        dashboard: result.value,
        activePeriod: period,
      }));
    },
    [accountRemoteId, accountType, getReportsDashboardUseCase, ownerUserRemoteId],
  );

  const loadDetail = useCallback(
    async (reportId: NonNullable<ReportQuery["reportId"]>, period: ReportQuery["period"]) => {
      setState((current) => ({
        ...current,
        isLoading: true,
        errorMessage: null,
        selectedReportId: reportId,
      }));

      const result = await getReportDetailUseCase.execute(
        buildQuery({
          accountType,
          ownerUserRemoteId,
          accountRemoteId,
          period,
          reportId,
        }),
      );

      if (!result.success) {
        setState((current) => ({
          ...current,
          isLoading: false,
          errorMessage: result.error.message,
          selectedReportId: null,
          detail: null,
        }));
        return;
      }

      setState((current) => ({
        ...current,
        isLoading: false,
        errorMessage: null,
        selectedReportId: reportId,
        detail: result.value,
        activePeriod: period,
      }));
    },
    [accountRemoteId, accountType, getReportDetailUseCase, ownerUserRemoteId],
  );

  useEffect(() => {
    loadDashboard(ReportPeriod.ThisMonth);
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    if (state.selectedReportId) {
      await loadDetail(state.selectedReportId, state.activePeriod);
      return;
    }

    await loadDashboard(state.activePeriod);
  }, [loadDashboard, loadDetail, state.activePeriod, state.selectedReportId]);

  const onSelectHomeTab = useCallback((tab: ReportsViewState["activeHomeTab"]) => {
    setState((current) => ({ ...current, activeHomeTab: tab }));
  }, []);

  const onSelectPeriod = useCallback(
    async (period: ReportQuery["period"]) => {
      if (state.selectedReportId) {
        await loadDetail(state.selectedReportId, period);
        return;
      }

      await loadDashboard(period);
    },
    [loadDashboard, loadDetail, state.selectedReportId],
  );

  const onOpenReport = useCallback(
    async (reportId: NonNullable<ReportQuery["reportId"]>) => {
      await loadDetail(reportId, state.activePeriod);
    },
    [loadDetail, state.activePeriod],
  );

  const onBackToReports = useCallback(() => {
    setState((current) => ({
      ...current,
      selectedReportId: null,
      detail: null,
      errorMessage: null,
    }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      isBusinessMode: accountType === AccountType.Business,
      onRefresh,
      onSelectHomeTab,
      onSelectPeriod,
      onOpenReport,
      onBackToReports,
    }),
    [accountType, onBackToReports, onOpenReport, onRefresh, onSelectHomeTab, onSelectPeriod, state],
  );
};
