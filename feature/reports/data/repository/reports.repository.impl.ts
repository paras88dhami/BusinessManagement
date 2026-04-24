import type { ReportsDatasource } from "@/feature/reports/data/dataSource/reports.datasource";
import {
  mapBillingDocumentModel,
  mapEmiPlanModel,
  mapInventoryMovementModel,
  mapLedgerEntryModel,
  mapMoneyAccountModel,
  mapProductModel,
  mapTransactionModel,
} from "@/feature/reports/mapper/reportDataset.mapper";
import type { ReportQuery } from "@/feature/reports/types/report.entity.types";
import {
  ReportDatabaseError,
  ReportUnknownError,
  ReportValidationError,
} from "@/feature/reports/types/report.error.types";
import type { ReportsRepository } from "./reports.repository";

export const createReportsRepository = (
  datasource: ReportsDatasource,
): ReportsRepository => ({
  async getReportsDataset(query: ReportQuery) {
    if (!query.accountRemoteId && !query.ownerUserRemoteId) {
      return {
        success: false,
        error: ReportValidationError("Active report scope is missing."),
      };
    }

    try {
      const datasetResult = await datasource.getDataset(query);

      if (!datasetResult.success) {
        return { success: false, error: ReportDatabaseError };
      }

      return {
        success: true,
        value: {
          transactions: datasetResult.value.transactions.map(mapTransactionModel),
          billingDocuments:
            datasetResult.value.billingDocuments.map(mapBillingDocumentModel),
          ledgerEntries: datasetResult.value.ledgerEntries.map(mapLedgerEntryModel),
          emiPlans: datasetResult.value.emiPlans.map(mapEmiPlanModel),
          inventoryMovements:
            datasetResult.value.inventoryMovements.map(mapInventoryMovementModel),
          products: datasetResult.value.products.map(mapProductModel),
          moneyAccounts:
            datasetResult.value.moneyAccounts.map(mapMoneyAccountModel),
        },
      };
    } catch {
      return { success: false, error: ReportUnknownError };
    }
  },
});
