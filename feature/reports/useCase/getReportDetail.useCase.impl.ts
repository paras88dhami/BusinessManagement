import { ReportsRepository } from "@/feature/reports/data/repository/reports.repository";
import { ReportQuery } from "@/feature/reports/types/report.entity.types";
import { GetReportDetailUseCase } from "./getReportDetail.useCase";

export const createGetReportDetailUseCase = (
  repository: ReportsRepository,
): GetReportDetailUseCase => ({
  async execute(query: ReportQuery) {
    return repository.getReportDetail(query);
  },
});
