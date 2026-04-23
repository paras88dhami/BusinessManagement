import { ReportCsvFileAdapter } from "@/feature/reports/adapter/reportCsvFile.adapter";
import { ExportReportCsvFileUseCase } from "./exportReportCsvFile.useCase";

export const createExportReportCsvFileUseCase = (
  adapter: ReportCsvFileAdapter,
): ExportReportCsvFileUseCase => ({
  async execute(params) {
    return adapter.exportCsvFile(params);
  },
});
