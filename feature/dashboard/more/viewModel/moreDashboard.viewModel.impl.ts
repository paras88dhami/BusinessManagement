import { useCallback, useMemo } from "react";
import { MoreDashboardSection } from "../types/moreDashboard.types";
import {
  MoreDashboardViewModel,
  UseMoreDashboardViewModelParams,
} from "./moreDashboard.viewModel";

const businessSections: readonly MoreDashboardSection[] = [
  {
    id: "account",
    title: "Account",
    items: [
      {
        id: "profile",
        title: "Profile",
        subtitle: "Your profile, switch account and logout",
      },
    ],
  },
  {
    id: "quick-tools",
    title: "Quick Tools",
    items: [
      {
        id: "ledger",
        title: "Ledger",
        subtitle: "Payables and receivables overview",
      },
      {
        id: "pos",
        title: "POS",
        subtitle: "Point of sale checkout",
      },
      {
        id: "emi",
        title: "EMI and Loans",
        subtitle: "Installment and loan tracking",
      },
    ],
  },
];

const personalSections: readonly MoreDashboardSection[] = [
  {
    id: "account",
    title: "Account",
    items: [
      {
        id: "profile",
        title: "Profile",
        subtitle: "Your profile, switch account and logout",
      },
    ],
  },
  {
    id: "personal-tools",
    title: "Personal Tools",
    items: [
      {
        id: "transactions",
        title: "Transactions",
        subtitle: "Income and expense records",
      },
      {
        id: "budget",
        title: "Budget",
        subtitle: "Monthly planning and spending limits",
      },
      {
        id: "emi",
        title: "EMI and Loans",
        subtitle: "Installment and loan tracking",
      },
    ],
  },
];

export const useMoreDashboardViewModel = (
  params: UseMoreDashboardViewModelParams,
): MoreDashboardViewModel => {
  const {
    isBusinessMode,
    onOpenProfile,
    onOpenLedger,
    onOpenPos,
    onOpenEmi,
    onOpenTransactions,
    onOpenBudget,
  } = params;

  const onMenuItemPress = useCallback(
    (itemId: string) => {
      switch (itemId) {
        case "profile":
          onOpenProfile();
          return;
        case "ledger":
          onOpenLedger();
          return;
        case "pos":
          onOpenPos();
          return;
        case "emi":
          onOpenEmi();
          return;
        case "transactions":
          onOpenTransactions();
          return;
        case "budget":
          onOpenBudget();
          return;
        default:
          return;
      }
    },
    [
      onOpenBudget,
      onOpenEmi,
      onOpenLedger,
      onOpenPos,
      onOpenProfile,
      onOpenTransactions,
    ],
  );

  const sections = isBusinessMode ? businessSections : personalSections;

  return useMemo<MoreDashboardViewModel>(
    () => ({
      sections,
      onMenuItemPress,
    }),
    [onMenuItemPress, sections],
  );
};
