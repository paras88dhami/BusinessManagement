import {
  BusinessDashboardProfitPoint,
  BusinessDashboardQuickAction,
  BusinessDashboardSummaryCard,
  BusinessDashboardTransactionRow,
} from "../types/businessDashboard.types";

export interface BusinessDashboardViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  currencyPrefix: string;
  summaryCards: readonly BusinessDashboardSummaryCard[];
  quickActions: readonly BusinessDashboardQuickAction[];
  onQuickActionPress: (actionId: BusinessDashboardQuickAction["id"]) => void;
  todayInValue: string;
  todayOutValue: string;
  overdueCountLabel: string;
  profitOverviewSeries: readonly BusinessDashboardProfitPoint[];
  todayTransactionRows: readonly BusinessDashboardTransactionRow[];
}
