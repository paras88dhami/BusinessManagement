export type PersonalDashboardSummaryCard = {
  id: string;
  title: string;
  value: string;
  tone: "income" | "expense" | "neutral";
};

export type PersonalDashboardQuickAction = {
  id: string;
  label: string;
};

export type PersonalDashboardRecentItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  tone: "income" | "expense";
};
