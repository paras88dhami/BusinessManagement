export type BusinessDashboardSummaryCard = {
  id: string;
  title: string;
  value: string;
  tone: "receive" | "pay";
};

export type BusinessDashboardQuickAction = {
  id: string;
  label: string;
};

export type BusinessDashboardDueItem = {
  id: string;
  name: string;
  subtitle: string;
  amount: string;
  direction: "receive" | "pay";
};
