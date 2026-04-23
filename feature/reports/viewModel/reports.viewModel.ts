import {
  ReportHomeTabValue,
  ReportMenuItemValue,
  ReportPeriodValue,
} from "@/feature/reports/types/report.entity.types";
import { ReportCsvExportAction } from "@/feature/reports/adapter/reportCsvFile.adapter";
import { ReportsViewState } from "@/feature/reports/types/report.state.types";
import { DocumentExportAction } from "@/shared/utils/document/exportDocument";

export type UseReportsViewModelParams = {
  accountType: import("@/feature/auth/accountSelection/types/accountSelection.types").AccountTypeValue;
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
  canExportReports: boolean;
  getReportsDashboardUseCase: import("@/feature/reports/useCase/getReportsDashboard.useCase").GetReportsDashboardUseCase;
  getReportDetailUseCase: import("@/feature/reports/useCase/getReportDetail.useCase").GetReportDetailUseCase;
  exportReportDetailDocumentUseCase: import("@/feature/reports/useCase/exportReportDetailDocument.useCase").ExportReportDetailDocumentUseCase;
  exportReportCsvFileUseCase: import("@/feature/reports/useCase/exportReportCsvFile.useCase").ExportReportCsvFileUseCase;
};

export interface ReportsViewModel extends ReportsViewState {
  isBusinessMode: boolean;
  canExportReports: boolean;
  onRefresh: () => Promise<void>;
  onSelectHomeTab: (tab: ReportHomeTabValue) => void;
  onSelectPeriod: (period: ReportPeriodValue) => Promise<void>;
  onOpenReport: (reportId: ReportMenuItemValue) => Promise<void>;
  onBackToReports: () => void;
  onExportDetail: (action: DocumentExportAction) => Promise<void>;
  onExportCsv: (action: ReportCsvExportAction) => Promise<void>;
}
