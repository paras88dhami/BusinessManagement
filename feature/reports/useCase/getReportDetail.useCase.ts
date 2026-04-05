import {
  ReportDetailResult,
  ReportQuery,
} from "@/feature/reports/types/report.entity.types";

export interface GetReportDetailUseCase {
  execute(query: ReportQuery): Promise<ReportDetailResult>;
}
