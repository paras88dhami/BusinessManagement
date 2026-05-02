import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { ReportHomeTab } from "@/feature/reports/types/report.entity.types";
import { REPORT_PERIOD_OPTIONS } from "@/feature/reports/types/report.state.types";
import { ReportsViewModel } from "@/feature/reports/viewModel/reports.viewModel";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { spacing } from "@/shared/components/theme/spacing";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isReportPeriodFilterable } from "../utils/reportPeriod.shared";
import { ExportPreviewCard, ReportListItems, ReportMenuSections, ReportsSummaryRow } from "./components/ReportCards";
import { DualLineChart, GroupedBarChart, LineAreaChart, SemiDonutChart, SingleBarChart } from "./components/ReportCharts";
import { ReportExportActionRow } from "./components/ReportExportActionRow";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

const HOME_TAB_OPTIONS = [
  { value: ReportHomeTab.Overview, label: "Overview" },
  { value: ReportHomeTab.IncomeExpense, label: "Income vs Expense" },
  { value: ReportHomeTab.Categories, label: "Categories" },
  { value: ReportHomeTab.CashFlow, label: "Cash Flow" },
] as const;

type Props = {
  viewModel: ReportsViewModel;
};

export function ReportsScreen({ viewModel }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <DashboardTabScaffold
      footer={null}
      baseBottomPadding={118}
      contentContainerStyle={styles.contentContainer}
      showDivider={false}
    >
      {viewModel.selectedReportId && viewModel.detail ? (
        <ReportDetailView viewModel={viewModel} />
      ) : (
        <ReportsHomeView viewModel={viewModel} />
      )}
    </DashboardTabScaffold>
  );
}

function ReportsHomeView({ viewModel }: Props) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const topSummary = viewModel.dashboard?.topSummary ?? {
    totalIncome: 0,
    totalExpense: 0,
    netCashFlow: 0,
  };

  const formattedTotalIncome = formatCurrencyAmount({
    amount: topSummary.totalIncome,
    currencyCode: viewModel.dashboard?.currencyCode,
    countryCode: viewModel.dashboard?.countryCode ?? null,
    maximumFractionDigits: 0,
  });
  const formattedTotalExpense = formatCurrencyAmount({
    amount: topSummary.totalExpense,
    currencyCode: viewModel.dashboard?.currencyCode,
    countryCode: viewModel.dashboard?.countryCode ?? null,
    maximumFractionDigits: 0,
  });
  const formattedNetCashFlow = formatCurrencyAmount({
    amount: topSummary.netCashFlow,
    currencyCode: viewModel.dashboard?.currencyCode,
    countryCode: viewModel.dashboard?.countryCode ?? null,
    maximumFractionDigits: 0,
  });

  const dashboardPeriodLabel = viewModel.dashboard?.periodLabel ?? "selected period";

  return (
    <View style={styles.screenGap}>
      {viewModel.errorMessage ? <ErrorCard message={viewModel.errorMessage} /> : null}

      <Card style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <Text style={styles.heroTitle}>This Period</Text>
          <Text style={styles.heroDate}>{viewModel.dashboard?.periodLabel ?? "This Month"}</Text>
        </View>
        <View style={styles.heroMetricsRow}>
          <View style={styles.heroMetricBlock}>
            <Text style={styles.heroMetricLabel}>Total Income</Text>
            <Text style={[styles.heroMetricValue, { color: theme.colors.success }]}>
              {formattedTotalIncome}
            </Text>
          </View>
          <View style={styles.heroMetricBlock}>
            <Text style={styles.heroMetricLabel}>Total Expense</Text>
            <Text
              style={[styles.heroMetricValue, { color: theme.colors.destructive }]}
            >
              {formattedTotalExpense}
            </Text>
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net Cash Flow</Text>
          <Text
            style={[
              styles.netValue,
              {
                color:
                  topSummary.netCashFlow >= 0
                    ? theme.colors.success
                    : theme.colors.destructive,
              },
            ]}
          >
            {formattedNetCashFlow}
          </Text>
        </View>
      </Card>

      <FilterChipGroup
        options={REPORT_PERIOD_OPTIONS}
        selectedValue={viewModel.activePeriod}
        onSelect={(value) => {
          void viewModel.onSelectPeriod(value);
        }}
      />

      <FilterChipGroup
        options={HOME_TAB_OPTIONS}
        selectedValue={viewModel.activeHomeTab}
        onSelect={viewModel.onSelectHomeTab}
      />

      <Card style={styles.chartCard}>
        {viewModel.activeHomeTab === ReportHomeTab.Overview ? (
          <>
            <Text style={styles.chartTitle}>Net Cash Flow Trend</Text>
            <Text style={styles.chartSubtitle}>
              {`Net cash flow trend for ${dashboardPeriodLabel}`}
            </Text>
            <LineAreaChart data={viewModel.dashboard?.overviewTrend ?? []} />
          </>
        ) : null}

        {viewModel.activeHomeTab === ReportHomeTab.IncomeExpense ? (
          <>
            <Text style={styles.chartTitle}>Income vs Expense</Text>
            <Text style={styles.chartSubtitle}>
              {`Income vs expense for ${dashboardPeriodLabel}`}
            </Text>
            <GroupedBarChart data={viewModel.dashboard?.incomeExpenseComparison ?? []} />
          </>
        ) : null}

        {viewModel.activeHomeTab === ReportHomeTab.Categories ? (
          <>
            <Text style={styles.chartTitle}>Expense Breakdown</Text>
            <Text style={styles.chartSubtitle}>
              {`Category breakdown for ${dashboardPeriodLabel}`}
            </Text>
            <SemiDonutChart segments={viewModel.dashboard?.categoryBreakdown ?? []} />
          </>
        ) : null}

        {viewModel.activeHomeTab === ReportHomeTab.CashFlow ? (
          <>
            <Text style={styles.chartTitle}>Daily Cash Flow</Text>
            <Text style={styles.chartSubtitle}>
              {`Inflow vs outflow for ${dashboardPeriodLabel}`}
            </Text>
            <DualLineChart data={viewModel.dashboard?.cashFlowSeries ?? []} />
          </>
        ) : null}
      </Card>

      <ReportMenuSections
        sections={viewModel.dashboard?.sections ?? []}
        onOpen={viewModel.onOpenReport}
      />
    </View>
  );
}

function ReportDetailView({ viewModel }: Props) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const detail = viewModel.detail;
  if (!detail) {
    return null;
  }

  const supportsPeriodFilter = isReportPeriodFilterable(detail.reportId);

  return (
    <View style={styles.screenGap}>
      <Pressable style={styles.backRow} onPress={viewModel.onBackToReports}>
        <ArrowLeft size={18} color={theme.colors.primary} />
        <Text style={styles.backText}>Back to Reports</Text>
      </Pressable>

      {supportsPeriodFilter ? (
        <FilterChipGroup
          options={REPORT_PERIOD_OPTIONS}
          selectedValue={viewModel.activePeriod}
          onSelect={(value) => {
            void viewModel.onSelectPeriod(value);
          }}
        />
      ) : null}

      {viewModel.canExportReports ? (
        <ReportExportActionRow
          canShareCsv={Boolean(detail.csvExport)}
          isExporting={viewModel.isExporting}
          activeExportAction={viewModel.activeExportAction}
          onShareCsv={() => {
            void viewModel.onShareCsvReport();
          }}
          onSharePdf={() => {
            void viewModel.onSharePdfReport();
          }}
          onPrint={() => {
            void viewModel.onPrintReport();
          }}
        />
      ) : viewModel.isBusinessMode ? (
        <Text style={styles.permissionHint}>
          You have view access only. Ask admin for export permission.
        </Text>
      ) : null}

      {viewModel.errorMessage ? <ErrorCard message={viewModel.errorMessage} /> : null}

      <ReportsSummaryRow cards={detail.summaryCards} />

      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>{detail.chartTitle}</Text>
        <Text style={styles.chartSubtitle}>{detail.chartSubtitle}</Text>

        {detail.chartKind === "line" && detail.lineSeries ? <LineAreaChart data={detail.lineSeries} /> : null}
        {detail.chartKind === "bars" && detail.barSeries ? (
          <SingleBarChart
            data={detail.barSeries}
            color={
              detail.reportId === "payment_report"
                ? theme.colors.destructive
                : theme.colors.success
            }
          />
        ) : null}
        {detail.chartKind === "dual-line" && detail.dualSeries ? <DualLineChart data={detail.dualSeries} /> : null}
        {detail.chartKind === "semi-donut" && detail.segments ? <SemiDonutChart segments={detail.segments} /> : null}
        {detail.chartKind === "semi-donut" && detail.listItems ? <ReportListItems items={detail.listItems} /> : null}
        {detail.chartKind === "export-preview" && detail.csvPreview ? <ExportPreviewCard csvPreview={detail.csvPreview} /> : null}
        {(detail.chartKind === "list" || detail.chartKind === "progress-list") && detail.listItems ? (
          <ReportListItems items={detail.listItems} />
        ) : null}
      </Card>
    </View>
  );
}

function ErrorCard({ message }: { message: string }) {
  const styles = useThemedStyles(createStyles);

  return (
    <Card style={styles.errorCard}>
      <Text style={styles.errorTitle}>Unable to load report</Text>
      <Text style={styles.errorMessage}>{message}</Text>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  contentContainer: {
    gap: theme.scaleSpace(spacing.md),
  },
  screenGap: {
    gap: theme.scaleSpace(spacing.md),
  },
  heroCard: {
    paddingVertical: theme.scaleSpace(spacing.md),
    paddingHorizontal: theme.scaleSpace(spacing.md),
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(17),
    fontFamily: "InterBold",
  },
  heroDate: {
    color: theme.colors.primary,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  heroMetricsRow: {
    marginTop: theme.scaleSpace(spacing.sm),
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.sm),
  },
  heroMetricBlock: {
    flex: 1,
  },
  heroMetricLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  heroMetricValue: {
    marginTop: theme.scaleSpace(8),
    fontSize: theme.scaleText(18),
    fontFamily: "InterBold",
  },
  heroDivider: {
    marginTop: theme.scaleSpace(spacing.md),
    height: 1,
    backgroundColor: theme.colors.border,
  },
  netRow: {
    marginTop: theme.scaleSpace(spacing.md),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(14),
  },
  netValue: {
    fontSize: theme.scaleText(18),
    fontFamily: "InterBold",
  },
  chartCard: {
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  chartTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(17),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(4),
  },
  chartSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    marginBottom: theme.scaleSpace(spacing.sm),
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.scaleText(15),
    fontFamily: "InterBold",
  },
  permissionHint: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  errorCard: {
    backgroundColor: theme.isDarkMode ? "rgba(228, 71, 71, 0.12)" : "#FFF6F6",
    borderColor: theme.isDarkMode ? "rgba(228, 71, 71, 0.25)" : "#F4D0D0",
  },
  errorTitle: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  errorMessage: {
    marginTop: theme.scaleSpace(6),
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
});
