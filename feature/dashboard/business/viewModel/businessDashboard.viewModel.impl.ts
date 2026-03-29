import { useMemo } from "react";
import {
  BusinessDashboardDueItem,
  BusinessDashboardQuickAction,
  BusinessDashboardSummaryCard,
} from "../types/businessDashboard.types";
import {
  BusinessDashboardViewModel,
  UseBusinessDashboardViewModelParams,
} from "./businessDashboard.viewModel";

const summaryCards: readonly BusinessDashboardSummaryCard[] = [
  {
    id: "to-receive",
    title: "To Receive",
    value: "NPR 1,25,000",
    tone: "receive",
  },
  {
    id: "to-pay",
    title: "To Pay",
    value: "NPR 45,000",
    tone: "pay",
  },
];

const quickActions: readonly BusinessDashboardQuickAction[] = [
  { id: "products", label: "Products" },
  { id: "billing", label: "Billing" },
  { id: "contacts", label: "Contacts" },
  { id: "transactions", label: "Txns" },
];

const dueItems: readonly BusinessDashboardDueItem[] = [
  {
    id: "ram-kumar",
    name: "Ram Kumar",
    subtitle: "Due today",
    amount: "NPR 15,000",
    direction: "receive",
  },
  {
    id: "shyam-store",
    name: "Shyam Store",
    subtitle: "Due today",
    amount: "NPR 8,500",
    direction: "pay",
  },
  {
    id: "sita-devi",
    name: "Sita Devi",
    subtitle: "Overdue 3 days",
    amount: "NPR 5,000",
    direction: "receive",
  },
];

export const useBusinessDashboardViewModel = (
  params: UseBusinessDashboardViewModelParams,
): BusinessDashboardViewModel => {
  const { onSwitchAccount, onLogout } = params;

  return useMemo<BusinessDashboardViewModel>(
    () => ({
      greetingLabel: "Good Evening",
      workspaceLabel: "My Business",
      summaryCards,
      quickActions,
      dueItems,
      onSwitchAccount,
      onLogout,
    }),
    [onLogout, onSwitchAccount],
  );
};
