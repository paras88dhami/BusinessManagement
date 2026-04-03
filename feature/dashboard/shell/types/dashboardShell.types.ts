import {
  DashboardTabItems,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";

export type DashboardRouteKey =
  | "business"
  | "personal"
  | "ledger"
  | "pos"
  | "products"
  | "inventory"
  | "emi-loans"
  | "more"
  | "user-management"
  | "personal-transactions"
  | "personal-budget"
  | "profile"
  | null;

export type DashboardHeaderConfig = {
  title: string;
  subtitle: string | null;
  showBell: boolean;
  showProfile: boolean;
  showBack: boolean;
};

export interface DashboardShellViewModel {
  isLoading: boolean;
  showSlotOnly: boolean;
  showScaffold: boolean;
  headerConfig: DashboardHeaderConfig;
  tabItems: DashboardTabItems;
  activeTab: DashboardTabValue;
  profileInitials: string;
  onProfilePress: () => void;
  onHeaderBack: () => void;
  onTabPress: (tab: DashboardTabValue) => void;
}
