import {
  BusinessDashboardDueItem,
  BusinessDashboardQuickAction,
  BusinessDashboardSummaryCard,
} from "../types/businessDashboard.types";

export interface BusinessDashboardViewModel {
  summaryCards: readonly BusinessDashboardSummaryCard[];
  quickActions: readonly BusinessDashboardQuickAction[];
  dueItems: readonly BusinessDashboardDueItem[];
}
