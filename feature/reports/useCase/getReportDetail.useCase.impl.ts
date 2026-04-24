import type { ReportsRepository } from "@/feature/reports/data/repository/reports.repository";
import { attachReportCsvExportSnapshot } from "@/feature/reports/readModel/buildReportCsvExportSnapshot.readModel";
import { buildReportDetailSnapshot } from "@/feature/reports/readModel/buildReportDetailSnapshot.readModel";
import type { ReportQuery } from "@/feature/reports/types/report.entity.types";
import {
  ReportNotFoundError,
  ReportValidationError,
} from "@/feature/reports/types/report.error.types";
import type { GetReportDetailUseCase } from "./getReportDetail.useCase";

type CreateGetReportDetailUseCaseOptions = {
  currencyCode: string | null;
  countryCode: string | null;
};

export const createGetReportDetailUseCase = (
  repository: ReportsRepository,
  options: CreateGetReportDetailUseCaseOptions,
): GetReportDetailUseCase => ({
  async execute(query: ReportQuery) {
    if (!query.reportId) {
      return {
        success: false,
        error: ReportValidationError("Report id is required."),
      };
    }

    const datasetResult = await repository.getReportsDataset(query);

    if (!datasetResult.success) {
      return datasetResult;
    }

    const detail = buildReportDetailSnapshot({
      query,
      dataset: datasetResult.value,
      currencyCode: options.currencyCode,
      countryCode: options.countryCode,
      nowMs: Date.now(),
    });

    if (!detail) {
      return {
        success: false,
        error: ReportNotFoundError,
      };
    }

    return {
      success: true,
      value: attachReportCsvExportSnapshot(detail),
    };
  },
});
