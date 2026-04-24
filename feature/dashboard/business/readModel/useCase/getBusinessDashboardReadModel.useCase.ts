import type {
  BusinessDashboardProfitPoint,
  BusinessDashboardSummaryCard,
  BusinessDashboardTransactionRow,
} from "../../types/businessDashboard.types";

export type GetBusinessDashboardReadModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  currencyCode: string | null;
  countryCode: string | null;
};

export type BusinessDashboardReadModel = {
  summaryCards: readonly BusinessDashboardSummaryCard[];
  todayInValue: string;
  todayOutValue: string;
  overdueCountLabel: string;
  profitOverviewSeries: readonly BusinessDashboardProfitPoint[];
  todayTransactionRows: readonly BusinessDashboardTransactionRow[];
};

export type BusinessDashboardReadModelError = {
  message: string;
};

export type BusinessDashboardReadModelResult =
  | {
      success: true;
      value: BusinessDashboardReadModel;
    }
  | {
      success: false;
      error: BusinessDashboardReadModelError;
    };

export interface GetBusinessDashboardReadModelUseCase {
  execute(
    params: GetBusinessDashboardReadModelParams,
  ): Promise<BusinessDashboardReadModelResult>;
}
