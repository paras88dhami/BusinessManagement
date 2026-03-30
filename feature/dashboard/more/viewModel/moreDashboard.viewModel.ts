import {
  DashboardTabItem,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { MoreDashboardSection } from "../types/moreDashboard.types";

export interface MoreDashboardViewModel {
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  sections: readonly MoreDashboardSection[];
  onTabPress: (tab: DashboardTabValue) => void;
  onMenuItemPress: (itemId: string) => void;
}

export type UseMoreDashboardViewModelParams = {
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  isBusinessMode: boolean;
  onTabPress: (tab: DashboardTabValue) => void;
  onOpenProfile: () => void;
  onOpenLedger: () => void;
  onOpenPos: () => void;
  onOpenEmi: () => void;
  onOpenTransactions: () => void;
  onOpenBudget: () => void;
};
