export const ROUTE_NAMES = [
  "home",
  "ledger",
  "pos",
  "transactions",
  "more",
  "profile",
] as const;

export type RouteName = (typeof ROUTE_NAMES)[number];

export type ScreenProps = {
  route: RouteName;
  onNavigate: (route: RouteName) => void;
};
