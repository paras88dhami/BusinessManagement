import {
  PersonalDashboardQuickAction,
  PersonalDashboardRecentItem,
  PersonalDashboardSummaryCard,
} from "../types/personalDashboard.types";

export interface PersonalDashboardViewModel {
  greetingLabel: string;
  workspaceLabel: string;
  summaryCards: readonly PersonalDashboardSummaryCard[];
  quickActions: readonly PersonalDashboardQuickAction[];
  recentItems: readonly PersonalDashboardRecentItem[];
  onSwitchAccount: () => void;
  onLogout: () => void;
}

export type UsePersonalDashboardViewModelParams = {
  onSwitchAccount: () => void;
  onLogout: () => void;
};
