import type { ChartDualSeriesPoint } from "@/shared/components/reusable/Charts/FinancialCharts";
import type { TransactionTableRow } from "@/shared/components/reusable/Tables/TransactionTable";

export type PersonalDashboardSummaryCard = {
  id: string;
  title: string;
  value: string;
  tone: "income" | "expense" | "neutral";
};

export type PersonalDashboardQuickAction = {
  id: "transactions" | "emi" | "budget" | "notes";
  label: string;
};

export type PersonalDashboardIncomeExpensePoint = ChartDualSeriesPoint;

export type PersonalDashboardTransactionRow = TransactionTableRow;
