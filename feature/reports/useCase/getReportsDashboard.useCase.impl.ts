import { ReportsRepository } from "@/feature/reports/data/repository/reports.repository";
import { ReportQuery } from "@/feature/reports/types/report.entity.types";
import { GetReportsDashboardUseCase } from "./getReportsDashboard.useCase";

export const createGetReportsDashboardUseCase = (
  repository: ReportsRepository,
): GetReportsDashboardUseCase => ({
  async execute(query: ReportQuery) {
    return repository.getReportsDashboard(query);
  },
});
