import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";

export const DashboardTab = {
  Home: "home",
  Ledger: "ledger",
  Pos: "pos",
  Emi: "emi",
  More: "more",
  Transactions: "transactions",
  Budget: "budget",
} as const;

export type DashboardTabValue =
  (typeof DashboardTab)[keyof typeof DashboardTab];

export type DashboardTabIconName =
  | "home"
  | "ledger"
  | "pos"
  | "emi"
  | "more"
  | "transactions"
  | "budget";

export type DashboardTabItem = {
  key: DashboardTabValue;
  label: string;
  icon: DashboardTabIconName;
  center: boolean;
};

export type DashboardTabItems = readonly DashboardTabItem[];

export type DashboardHomeType = AccountTypeValue;
