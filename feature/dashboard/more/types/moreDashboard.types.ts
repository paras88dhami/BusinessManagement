export type MoreDashboardMenuItemId =
  | "profile"
  | "ledger"
  | "pos"
  | "orders"
  | "products"
  | "categories"
  | "inventory"
  | "moneyAccounts"
  | "contacts"
  | "billing"
  | "taxCalculator"
  | "notes"
  | "emi"
  | "transactions"
  | "budget"
  | "userManagement";

export type MoreDashboardMenuItem = {
  id: MoreDashboardMenuItemId;
  title: string;
  subtitle: string;
};

export type MoreDashboardSection = {
  id: string;
  title: string;
  items: readonly MoreDashboardMenuItem[];
};

export type MoreDashboardMenuAccessPredicate = (
  itemId: MoreDashboardMenuItemId,
) => boolean;
