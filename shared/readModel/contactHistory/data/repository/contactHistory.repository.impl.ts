import { ContactHistoryDatasource } from "@/shared/readModel/contactHistory/data/dataSource/contactHistory.datasource";
import { ContactHistoryRepository } from "@/shared/readModel/contactHistory/data/repository/contactHistory.repository";
import { buildContactHistoryReadModel } from "@/shared/readModel/contactHistory/data/repository/mapper/contactHistory.mapper";
import {
  ContactHistoryDatabaseError,
  ContactHistoryNotFoundError,
  ContactHistoryUnknownError,
  ContactHistoryValidationError,
} from "@/shared/readModel/contactHistory/types/contactHistory.error.types";
import { ContactHistoryQuery } from "@/shared/readModel/contactHistory/types/contactHistory.query.types";
import { ContactHistoryReadModel } from "@/shared/readModel/contactHistory/types/contactHistory.readModel.types";
import { Result } from "@/shared/types/result.types";

const mapDatasourceError = (error: Error) => {
  const normalizedMessage = error.message.trim().toLowerCase();

  if (normalizedMessage.includes("not found")) {
    return ContactHistoryNotFoundError;
  }

  if (
    normalizedMessage.includes("required") ||
    normalizedMessage.includes("invalid")
  ) {
    return ContactHistoryValidationError(error.message);
  }

  if (normalizedMessage.includes("database")) {
    return ContactHistoryDatabaseError;
  }

  return {
    ...ContactHistoryUnknownError,
    message: error.message || ContactHistoryUnknownError.message,
  };
};

export const createContactHistoryRepository = (
  datasource: ContactHistoryDatasource,
): ContactHistoryRepository => ({
  async getContactHistoryReadModel(
    query: ContactHistoryQuery,
  ): Promise<
    Result<
      ContactHistoryReadModel,
      import("@/shared/readModel/contactHistory/types/contactHistory.error.types").ContactHistoryError
    >
  > {
    const result = await datasource.getDataset(query);

    if (!result.success) {
      return {
        success: false,
        error: mapDatasourceError(result.error),
      };
    }

    return {
      success: true,
      value: buildContactHistoryReadModel({
        accountRemoteId: query.accountRemoteId,
        contactRemoteId: query.contactRemoteId,
        transactions: result.value.transactions,
        billingDocuments: result.value.billingDocuments,
        ledgerEntries: result.value.ledgerEntries,
        orders: result.value.orders,
        posSales: result.value.posSales,
        timelineLimit: query.timelineLimit ?? 50,
      }),
    };
  },
});

