import { useMemo } from "react";
import {
  PersonalDashboardQuickAction,
  PersonalDashboardRecentItem,
  PersonalDashboardSummaryCard,
} from "../types/personalDashboard.types";
import { PersonalDashboardViewModel } from "./personalDashboard.viewModel";

const summaryCards: readonly PersonalDashboardSummaryCard[] = [
  {
    id: "total-income",
    title: "Monthly Income",
    value: "NPR 85,000",
    tone: "income",
  },
  {
    id: "total-expense",
    title: "Monthly Expense",
    value: "NPR 42,500",
    tone: "expense",
  },
  {
    id: "net-balance",
    title: "Net Balance",
    value: "NPR 42,500",
    tone: "neutral",
  },
];

const quickActions: readonly PersonalDashboardQuickAction[] = [
  { id: "transactions", label: "Transactions" },
  { id: "emi", label: "EMI & Loans" },
  { id: "reports", label: "Reports" },
  { id: "budget", label: "Budget" },
];

const recentItems: readonly PersonalDashboardRecentItem[] = [
  {
    id: "salary-1",
    title: "Salary Received",
    subtitle: "Today, 09:30 AM",
    amount: "+ NPR 50,000",
    tone: "income",
  },
  {
    id: "rent-1",
    title: "House Rent",
    subtitle: "Yesterday",
    amount: "- NPR 15,000",
    tone: "expense",
  },
  {
    id: "groceries-1",
    title: "Groceries",
    subtitle: "Yesterday",
    amount: "- NPR 3,200",
    tone: "expense",
  },
];

export const usePersonalDashboardViewModel = (): PersonalDashboardViewModel => {
  return useMemo<PersonalDashboardViewModel>(
    () => ({
      summaryCards,
      quickActions,
      recentItems,
    }),
    [],
  );
};
