import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { Result } from "@/shared/types/result.types";

export const ReportScope = {
  Personal: "personal",
  Business: "business",
} as const;
export type ReportScopeValue = (typeof ReportScope)[keyof typeof ReportScope];

export const ReportPeriod = {
  Today: "today",
  ThisWeek: "this_week",
  ThisMonth: "this_month",
  ThisQuarter: "this_quarter",
  ThisYear: "this_year",
  LastSixMonths: "last_6_months",
} as const;
export type ReportPeriodValue = (typeof ReportPeriod)[keyof typeof ReportPeriod];

export const ReportHomeTab = {
  Overview: "overview",
  IncomeExpense: "income_vs_expense",
  Categories: "categories",
  CashFlow: "cash_flow",
} as const;
export type ReportHomeTabValue = (typeof ReportHomeTab)[keyof typeof ReportHomeTab];

export const ReportMenuItem = {
  Sales: "sales_report",
  PartyBalances: "party_balances",
  Collection: "collection_report",
  Payment: "payment_report",
  CategorySummary: "category_summary",
  AccountStatement: "account_statement",
  EmiLoan: "emi_loan_report",
  Stock: "stock_report",
  ExportData: "export_data",
} as const;
export type ReportMenuItemValue = (typeof ReportMenuItem)[keyof typeof ReportMenuItem];

export type ReportQuery = {
  accountType: AccountTypeValue;
  scope: ReportScopeValue;
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
  period: ReportPeriodValue;
  reportId?: ReportMenuItemValue | null;
};

export type ReportSummaryTone = "positive" | "negative" | "neutral";

export type ReportSummaryCard = {
  id: string;
  label: string;
  value: string;
  tone: ReportSummaryTone;
};

export type ReportSeriesPoint = {
  label: string;
  value: number;
};

export type ReportDualSeriesPoint = {
  label: string;
  primaryValue: number;
  secondaryValue: number;
};

export type ReportSegment = {
  label: string;
  value: number;
  color: string;
};

export type ReportListItem = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  tone?: ReportSummaryTone;
  progressRatio?: number | null;
};

export type ReportCsvExportSnapshot = {
  fileName: string;
  content: string;
  mimeType: "text/csv";
};

export type ReportMenuEntry = {
  id: ReportMenuItemValue;
  title: string;
  subtitle: string;
  value?: string;
};

export type ReportMenuSection = {
  id: string;
  title: string;
  items: readonly ReportMenuEntry[];
};

export type ReportsDashboardSnapshot = {
  scope: ReportScopeValue;
  currencyCode: string | null;
  countryCode: string | null;
  periodLabel: string;
  topSummary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
  overviewTrend: readonly ReportSeriesPoint[];
  incomeExpenseComparison: readonly ReportDualSeriesPoint[];
  categoryBreakdown: readonly ReportSegment[];
  cashFlowSeries: readonly ReportDualSeriesPoint[];
  sections: readonly ReportMenuSection[];
};

export type ReportDetailSnapshot = {
  reportId: ReportMenuItemValue;
  title: string;
  periodLabel: string;
  summaryCards: readonly ReportSummaryCard[];
  chartTitle: string;
  chartSubtitle: string;
  chartKind:
    | "line"
    | "bars"
    | "dual-line"
    | "semi-donut"
    | "list"
    | "progress-list"
    | "export-preview";
  lineSeries?: readonly ReportSeriesPoint[];
  barSeries?: readonly ReportSeriesPoint[];
  dualSeries?: readonly ReportDualSeriesPoint[];
  segments?: readonly ReportSegment[];
  listItems?: readonly ReportListItem[];
  csvPreview?: string;
  csvExport?: ReportCsvExportSnapshot;
};

export type ReportsDashboardResult = Result<
  ReportsDashboardSnapshot,
  import("./report.error.types").ReportError
>;

export type ReportDetailResult = Result<
  ReportDetailSnapshot,
  import("./report.error.types").ReportError
>;
