export type MoreDashboardMenuItemId =
  | "profile"
  | "ledger"
  | "pos"
  | "emi"
  | "transactions"
  | "budget";

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
