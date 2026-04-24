import {
  ReportQuery,
  ReportsDatasetResult,
} from "@/feature/reports/types/report.entity.types";

export interface ReportsRepository {
  getReportsDataset(query: ReportQuery): Promise<ReportsDatasetResult>;
}
