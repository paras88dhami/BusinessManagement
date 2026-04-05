import type { ChartSeriesPoint } from "@/shared/components/reusable/Charts/FinancialCharts";
import type { TransactionTableRow } from "@/shared/components/reusable/Tables/TransactionTable";

export type BusinessDashboardSummaryCard = {
  id: string;
  title: string;
  value: string;
  tone: "receive" | "pay";
};

export type BusinessDashboardQuickAction = {
  id: "orders" | "products" | "billing" | "contacts";
  label: string;
};

export type BusinessDashboardProfitPoint = ChartSeriesPoint;

export type BusinessDashboardTransactionRow = TransactionTableRow;
