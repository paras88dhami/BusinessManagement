import { ReportCsvExportAction } from "@/feature/reports/adapter/reportCsvFile.adapter";
import { ReportCsvExportSnapshot } from "@/feature/reports/types/report.entity.types";
import { ReportError } from "@/feature/reports/types/report.error.types";
import { Result } from "@/shared/types/result.types";

export type ExportReportCsvFileParams = {
  csvExport: ReportCsvExportSnapshot;
  action: ReportCsvExportAction;
  dialogTitle: string;
};

export interface ExportReportCsvFileUseCase {
  execute(
    params: ExportReportCsvFileParams,
  ): Promise<Result<boolean, ReportError>>;
}
