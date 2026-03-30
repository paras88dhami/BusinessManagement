import {
  PersonalDashboardQuickAction,
  PersonalDashboardRecentItem,
  PersonalDashboardSummaryCard,
} from "../types/personalDashboard.types";

export interface PersonalDashboardViewModel {
  summaryCards: readonly PersonalDashboardSummaryCard[];
  quickActions: readonly PersonalDashboardQuickAction[];
  recentItems: readonly PersonalDashboardRecentItem[];
}
