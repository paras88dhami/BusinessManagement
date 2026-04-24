import {
  attachReportCsvExportSnapshot,
  buildReportCsvExportSnapshot,
} from "@/feature/reports/readModel/buildReportCsvExportSnapshot.readModel";
import {
  ReportMenuItem,
  type ReportDetailSnapshot,
} from "@/feature/reports/types/report.entity.types";
import { describe, expect, it } from "vitest";

const createBaseDetail = (
  overrides: Partial<ReportDetailSnapshot> = {},
): ReportDetailSnapshot => ({
  reportId: ReportMenuItem.Sales,
  title: "Sales Report",
  periodLabel: "This Month",
  summaryCards: [
    { id: "total", label: "Total", value: "100", tone: "positive" },
  ],
  chartTitle: "Chart",
  chartSubtitle: "Subtitle",
  chartKind: "line",
  ...overrides,
});

describe("reports export parity read model", () => {
  it("exports list reports from listItems rows", () => {
    const detail = createBaseDetail({
      reportId: ReportMenuItem.AccountStatement,
      chartKind: "list",
      listItems: [
        {
          id: "row-1",
          title: "Cash",
          subtitle: "Money In 100 | Money Out 20",
          value: "80",
          tone: "positive",
          progressRatio: null,
        },
      ],
    });

    const csv = buildReportCsvExportSnapshot(detail);

    expect(csv.content).toBe(
      ["title,subtitle,value,tone", "Cash,Money In 100 | Money Out 20,80,positive"].join(
        "\n",
      ),
    );
  });

  it("exports chart reports from segment or series rows", () => {
    const segmentDetail = createBaseDetail({
      reportId: ReportMenuItem.CategorySummary,
      chartKind: "semi-donut",
      segments: [
        { label: "Food", value: 20, color: "#1F8A4C" },
      ],
    });

    const lineDetail = createBaseDetail({
      reportId: ReportMenuItem.Sales,
      chartKind: "line",
      lineSeries: [
        { label: "W1", value: 50 },
      ],
    });

    const segmentCsv = buildReportCsvExportSnapshot(segmentDetail);
    const lineCsv = buildReportCsvExportSnapshot(lineDetail);

    expect(segmentCsv.content).toBe(["label,value", "Food,20"].join("\n"));
    expect(lineCsv.content).toBe(["label,value", "W1,50"].join("\n"));
  });

  it("falls back to summary cards when no list or chart rows are available", () => {
    const detail = createBaseDetail({
      reportId: ReportMenuItem.ExportData,
      chartKind: "export-preview",
      summaryCards: [
        { id: "scope", label: "Scope", value: "Business", tone: "neutral" },
        { id: "rows", label: "Rows", value: "7", tone: "neutral" },
      ],
      listItems: undefined,
      segments: undefined,
      lineSeries: undefined,
      barSeries: undefined,
      dualSeries: undefined,
    });

    const attached = attachReportCsvExportSnapshot(detail);

    expect(attached.csvPreview).toBe(
      ["label,value", "Scope,Business", "Rows,7"].join("\n"),
    );
    expect(attached.csvExport).toEqual({
      fileName: "report_export_export_data.csv",
      mimeType: "text/csv",
      content: ["label,value", "Scope,Business", "Rows,7"].join("\n"),
    });
  });
});
