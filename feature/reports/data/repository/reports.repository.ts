import {
  ReportDetailResult,
  ReportsDashboardResult,
  ReportQuery,
} from "@/feature/reports/types/report.entity.types";

export interface ReportsRepository {
  getReportsDashboard(query: ReportQuery): Promise<ReportsDashboardResult>;
  getReportDetail(query: ReportQuery): Promise<ReportDetailResult>;
}
