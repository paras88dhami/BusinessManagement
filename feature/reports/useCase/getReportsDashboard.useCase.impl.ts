import type { ReportsRepository } from "@/feature/reports/data/repository/reports.repository";
import { buildReportsDashboardSnapshot } from "@/feature/reports/readModel/buildReportsDashboardSnapshot.readModel";
import type { ReportQuery } from "@/feature/reports/types/report.entity.types";
import type { GetReportsDashboardUseCase } from "./getReportsDashboard.useCase";

type CreateGetReportsDashboardUseCaseOptions = {
  currencyCode: string | null;
  countryCode: string | null;
};

export const createGetReportsDashboardUseCase = (
  repository: ReportsRepository,
  options: CreateGetReportsDashboardUseCaseOptions,
): GetReportsDashboardUseCase => ({
  async execute(query: ReportQuery) {
    const datasetResult = await repository.getReportsDataset(query);

    if (!datasetResult.success) {
      return datasetResult;
    }

    return {
      success: true,
      value: buildReportsDashboardSnapshot({
        query,
        dataset: datasetResult.value,
        currencyCode: options.currencyCode,
        countryCode: options.countryCode,
        nowMs: Date.now(),
      }),
    };
  },
});
