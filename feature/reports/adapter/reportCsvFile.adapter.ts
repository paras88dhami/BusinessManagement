import { ReportCsvExportSnapshot } from "@/feature/reports/types/report.entity.types";
import { ReportError } from "@/feature/reports/types/report.error.types";
import { Result } from "@/shared/types/result.types";

export type ReportCsvExportAction = "share" | "save";

export type ExportReportCsvFilePayload = {
  csvExport: ReportCsvExportSnapshot;
  action: ReportCsvExportAction;
  dialogTitle: string;
};

export interface ReportCsvFileAdapter {
  exportCsvFile(
    payload: ExportReportCsvFilePayload,
  ): Promise<Result<boolean, ReportError>>;
}
