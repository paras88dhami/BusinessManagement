import {
  BusinessDashboardDueItem,
  BusinessDashboardQuickAction,
  BusinessDashboardSummaryCard,
} from "../types/businessDashboard.types";

export interface BusinessDashboardViewModel {
  greetingLabel: string;
  workspaceLabel: string;
  summaryCards: readonly BusinessDashboardSummaryCard[];
  quickActions: readonly BusinessDashboardQuickAction[];
  dueItems: readonly BusinessDashboardDueItem[];
  onSwitchAccount: () => void;
  onLogout: () => void;
}

export type UseBusinessDashboardViewModelParams = {
  onSwitchAccount: () => void;
  onLogout: () => void;
};
