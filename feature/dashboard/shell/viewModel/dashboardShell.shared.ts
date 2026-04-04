import {
    AccountType,
    AccountTypeValue,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
import {
    DashboardTab,
    DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import {
    DashboardHeaderConfig,
    DashboardRouteKey,
} from "@/feature/dashboard/shell/types/dashboardShell.types";

const BUSINESS_ONLY_ROUTES = new Set<DashboardRouteKey>([
  "business",
  "ledger",
  "pos",
  "products",
  "inventory",
  "billing",
  "tax-calculator",
  "user-management",
]);

const PERSONAL_ONLY_ROUTES = new Set<DashboardRouteKey>([
  "personal",
  "personal-transactions",
  "personal-budget",
]);

const SLOT_ONLY_ROUTES = new Set<DashboardRouteKey>([
  "profile",
  "user-management",
]);

export const resolveDashboardRouteKey = (
  segments: string[],
): DashboardRouteKey => {
  const routeKey = segments[1];

  switch (routeKey) {
    case "business":
    case "personal":
    case "ledger":
    case "pos":
    case "products":
    case "categories":
    case "inventory":
    case "money-accounts":
    case "contacts":
    case "billing":
    case "tax-calculator":
    case "notes":
    case "emi-loans":
    case "more":
    case "user-management":
    case "personal-transactions":
    case "personal-budget":
    case "profile":
      return routeKey;
    default:
      return null;
  }
};

export const resolveDashboardHeaderConfig = (params: {
  routeKey: DashboardRouteKey;
  activeAccountDisplayName: string;
  profileName: string;
}): DashboardHeaderConfig => {
  const { routeKey, activeAccountDisplayName, profileName } = params;

  switch (routeKey) {
    case "business":
      return {
        title: activeAccountDisplayName.trim() || "Business",
        subtitle: "Good Evening",
        showBell: true,
        showProfile: true,
        showBack: false,
      };
    case "personal":
      return {
        title: profileName.trim() || "Personal",
        subtitle: "Good Evening",
        showBell: true,
        showProfile: true,
        showBack: false,
      };
    case "ledger":
      return {
        title: "Ledger",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
    case "pos":
      return {
        title: "POS",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "products":
      return {
        title: "Products",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "categories":
      return {
        title: "Categories",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "inventory":
      return {
        title: "Inventory",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "money-accounts":
      return {
        title: "Money Accounts",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "contacts":
      return {
        title: "Contacts",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "billing":
      return {
        title: "Billing",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "tax-calculator":
      return {
        title: "Tax Calculator",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "notes":
      return {
        title: "Notes",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: true,
      };
    case "emi-loans":
      return {
        title: "EMI and Loans",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
    case "more":
      return {
        title: "More",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
    case "user-management":
      return {
        title: "User Management",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
    case "personal-transactions":
      return {
        title: "Transactions",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
    case "personal-budget":
      return {
        title: "Budget",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
    default:
      return {
        title: "Dashboard",
        subtitle: null,
        showBell: false,
        showProfile: false,
        showBack: false,
      };
  }
};

export const resolveDashboardActiveTab = (
  routeKey: DashboardRouteKey,
): DashboardTabValue => {
  switch (routeKey) {
    case "business":
    case "personal":
      return DashboardTab.Home;
    case "ledger":
      return DashboardTab.Ledger;
    case "pos":
      return DashboardTab.Pos;
    case "emi-loans":
      return DashboardTab.Emi;
    case "more":
    case "products":
    case "categories":
    case "inventory":
    case "money-accounts":
    case "contacts":
    case "billing":
    case "tax-calculator":
    case "notes":
      return DashboardTab.More;
    case "personal-transactions":
      return DashboardTab.Transactions;
    case "personal-budget":
      return DashboardTab.Budget;
    default:
      return DashboardTab.Home;
  }
};

export const isBusinessOnlyDashboardRoute = (
  routeKey: DashboardRouteKey,
): boolean => {
  return BUSINESS_ONLY_ROUTES.has(routeKey);
};

export const isPersonalOnlyDashboardRoute = (
  routeKey: DashboardRouteKey,
): boolean => {
  return PERSONAL_ONLY_ROUTES.has(routeKey);
};

export const isSlotOnlyDashboardRoute = (
  routeKey: DashboardRouteKey,
): boolean => {
  return SLOT_ONLY_ROUTES.has(routeKey);
};

export const isDashboardRouteAllowed = (
  routeKey: DashboardRouteKey,
  accountType: AccountTypeValue | null,
): boolean => {
  if (!routeKey) {
    return false;
  }

  if (isBusinessOnlyDashboardRoute(routeKey)) {
    return accountType === AccountType.Business;
  }

  if (isPersonalOnlyDashboardRoute(routeKey)) {
    return accountType === AccountType.Personal;
  }

  return true;
};
