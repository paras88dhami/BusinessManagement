import {
  ReportQuery,
  ReportsDashboardResult,
} from "@/feature/reports/types/report.entity.types";

export interface GetReportsDashboardUseCase {
  execute(query: ReportQuery): Promise<ReportsDashboardResult>;
}
