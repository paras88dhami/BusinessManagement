import {
  PersonalDashboardIncomeExpensePoint,
  PersonalDashboardQuickAction,
  PersonalDashboardSummaryCard,
  PersonalDashboardTransactionRow,
} from "../types/personalDashboard.types";

export interface PersonalDashboardViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  summaryCards: readonly PersonalDashboardSummaryCard[];
  quickActions: readonly PersonalDashboardQuickAction[];
  onQuickActionPress: (actionId: PersonalDashboardQuickAction["id"]) => void;
  todayInValue: string;
  todayOutValue: string;
  netValue: string;
  incomeExpenseSeries: readonly PersonalDashboardIncomeExpensePoint[];
  transactionRows: readonly PersonalDashboardTransactionRow[];
}
