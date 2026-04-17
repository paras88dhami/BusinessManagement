import {
  BillingDocumentType,
  BillingTemplateType,
} from "@/feature/billing/types/billing.types";
import type { GetBillingOverviewUseCase } from "@/feature/billing/useCase/getBillingOverview.useCase";
import type { GetPosSaleHistoryUseCase } from "./getPosSaleHistory.useCase";
import { PosErrorType } from "../types/pos.error.types";

interface CreateGetPosSaleHistoryUseCaseParams {
  getBillingOverviewUseCase: GetBillingOverviewUseCase;
}

export const createGetPosSaleHistoryUseCase = ({
  getBillingOverviewUseCase,
}: CreateGetPosSaleHistoryUseCaseParams): GetPosSaleHistoryUseCase => ({
  async execute(params) {
    const accountRemoteId = params.accountRemoteId.trim();

    if (!accountRemoteId) {
      return {
        success: false,
        error: {
          type: PosErrorType.ContextRequired,
          message: "Account context is required to load POS sale history.",
        },
      };
    }

    const result = await getBillingOverviewUseCase.execute(accountRemoteId);

    if (!result.success) {
      return {
        success: false,
        error: {
          type: PosErrorType.Unknown,
          message: result.error.message,
        },
      };
    }

    const normalizedSearch = params.searchTerm?.trim().toLowerCase() ?? "";

    const receipts = result.value.documents
      .filter(
        (document) =>
          document.documentType === BillingDocumentType.Receipt &&
          document.templateType === BillingTemplateType.PosReceipt,
      )
      .filter((document) => {
        if (!normalizedSearch) {
          return true;
        }

        const customerName = document.customerName.toLowerCase();
        const documentNumber = document.documentNumber.toLowerCase();
        return (
          customerName.includes(normalizedSearch) ||
          documentNumber.includes(normalizedSearch)
        );
      })
      .sort((left, right) => right.issuedAt - left.issuedAt);

    return {
      success: true,
      value: receipts,
    };
  },
});
