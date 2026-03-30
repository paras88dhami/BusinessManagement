import {
  AccountType,
  AccountTypeValue,
} from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import {
  DashboardTab,
  DashboardTabItems,
  DashboardTabValue,
} from "../types/dashboardNavigation.types";

export type DashboardHomePath = "/(dashboard)/business" | "/(dashboard)/personal";

export type DashboardTabPath =
  | DashboardHomePath
  | "/(dashboard)/ledger"
  | "/(dashboard)/pos"
  | "/(dashboard)/emi-loans"
  | "/(dashboard)/more"
  | "/(dashboard)/personal-transactions"
  | "/(dashboard)/personal-budget";

export const BUSINESS_DASHBOARD_TABS: DashboardTabItems = [
  { key: DashboardTab.Home, label: "Home", icon: "home" },
  { key: DashboardTab.Ledger, label: "Ledger", icon: "ledger" },
  { key: DashboardTab.Pos, label: "POS", icon: "pos", center: true },
  { key: DashboardTab.Emi, label: "EMI", icon: "emi" },
  { key: DashboardTab.More, label: "More", icon: "more" },
] as const;

export const PERSONAL_DASHBOARD_TABS: DashboardTabItems = [
  { key: DashboardTab.Home, label: "Home", icon: "home" },
  { key: DashboardTab.Emi, label: "EMI", icon: "emi" },
  {
    key: DashboardTab.Transactions,
    label: "Txns",
    icon: "transactions",
    center: true,
  },
  { key: DashboardTab.Budget, label: "Budget", icon: "budget" },
  { key: DashboardTab.More, label: "More", icon: "more" },
] as const;

export const getDashboardHomePath = (
  accountType: AccountTypeValue | null,
): DashboardHomePath => {
  if (accountType === AccountType.Business) {
    return "/(dashboard)/business";
  }

  return "/(dashboard)/personal";
};

export const getDashboardTabItems = (
  accountType: AccountTypeValue | null,
): DashboardTabItems => {
  if (accountType === AccountType.Business) {
    return BUSINESS_DASHBOARD_TABS;
  }

  return PERSONAL_DASHBOARD_TABS;
};

export const getDashboardTabPath = (
  tab: DashboardTabValue,
  accountType: AccountTypeValue | null,
): DashboardTabPath => {
  switch (tab) {
    case DashboardTab.Home:
      return getDashboardHomePath(accountType);
    case DashboardTab.Ledger:
      return accountType === AccountType.Business
        ? "/(dashboard)/ledger"
        : "/(dashboard)/personal-transactions";
    case DashboardTab.Pos:
      return accountType === AccountType.Business
        ? "/(dashboard)/pos"
        : getDashboardHomePath(accountType);
    case DashboardTab.Emi:
      return "/(dashboard)/emi-loans";
    case DashboardTab.More:
      return "/(dashboard)/more";
    case DashboardTab.Transactions:
      return "/(dashboard)/personal-transactions";
    case DashboardTab.Budget:
      return "/(dashboard)/personal-budget";
    default:
      return getDashboardHomePath(accountType);
  }
};

export const getAccountTypeLabel = (
  accountType: AccountTypeValue | null,
): string => {
  if (accountType === AccountType.Business) {
    return "Business";
  }

  return "Personal";
};

export const getAccountRoleLabel = (
  accountType: AccountTypeValue | null,
): string => {
  if (accountType === AccountType.Business) {
    return "Business Owner";
  }

  return "Personal Account";
};

export const buildInitials = (name: string | null | undefined): string => {
  const normalizedName = (name ?? "").trim();

  if (!normalizedName) {
    return "EL";
  }

  const nameParts = normalizedName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (nameParts.length === 0) {
    return "EL";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
};
