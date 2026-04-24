import type {
  ReportCsvExportSnapshot,
  ReportDetailSnapshot,
} from "@/feature/reports/types/report.entity.types";

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const normalized = String(value).replace(/\r?\n/g, "\\n");

  if (
    normalized.includes(",") ||
    normalized.includes("\"") ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  return normalized;
};

const toCsvLine = (values: readonly unknown[]): string =>
  values.map(escapeCsvValue).join(",");

const buildRowsFromDetail = (
  detail: ReportDetailSnapshot,
): readonly (readonly unknown[])[] => {
  if (detail.listItems?.length) {
    return [
      ["title", "subtitle", "value", "tone"],
      ...detail.listItems.map((item) => [
        item.title,
        item.subtitle,
        item.value,
        item.tone ?? "",
      ]),
    ];
  }

  if (detail.segments?.length) {
    return [
      ["label", "value"],
      ...detail.segments.map((segment) => [segment.label, segment.value]),
    ];
  }

  if (detail.lineSeries?.length) {
    return [
      ["label", "value"],
      ...detail.lineSeries.map((point) => [point.label, point.value]),
    ];
  }

  if (detail.barSeries?.length) {
    return [
      ["label", "value"],
      ...detail.barSeries.map((point) => [point.label, point.value]),
    ];
  }

  if (detail.dualSeries?.length) {
    return [
      ["label", "primaryValue", "secondaryValue"],
      ...detail.dualSeries.map((point) => [
        point.label,
        point.primaryValue,
        point.secondaryValue,
      ]),
    ];
  }

  return [
    ["label", "value"],
    ...detail.summaryCards.map((card) => [card.label, card.value]),
  ];
};

const buildCsvFileName = (detail: ReportDetailSnapshot): string =>
  `report_export_${detail.reportId}.csv`;

export const buildReportCsvExportSnapshot = (
  detail: ReportDetailSnapshot,
): ReportCsvExportSnapshot => {
  const rows = buildRowsFromDetail(detail);

  return {
    fileName: buildCsvFileName(detail),
    mimeType: "text/csv",
    content: rows.map(toCsvLine).join("\n"),
  };
};

export const attachReportCsvExportSnapshot = (
  detail: ReportDetailSnapshot,
): ReportDetailSnapshot => ({
  ...detail,
  csvPreview: buildReportCsvExportSnapshot(detail).content,
  csvExport: buildReportCsvExportSnapshot(detail),
});
