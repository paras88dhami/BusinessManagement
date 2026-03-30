export const ROUTE_NAMES = [
  "home",
  "ledger",
  "pos",
  "transactions",
  "budget",
  "emi",
  "more",
  "profile",
] as const;

export type RouteName = (typeof ROUTE_NAMES)[number];

export type BottomTabIconName =
  | "home"
  | "ledger"
  | "pos"
  | "transactions"
  | "budget"
  | "emi"
  | "more";

export type BottomTabItem<T extends string = RouteName> = {
  key: T;
  label: string;
  icon?: BottomTabIconName;
  center?: boolean;
};

export type ScreenProps = {
  route: RouteName;
  onNavigate: (route: RouteName) => void;
};
