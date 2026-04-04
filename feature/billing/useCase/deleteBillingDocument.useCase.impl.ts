import { BillingRepository } from "@/feature/billing/data/repository/billing.repository";
import { DeleteBillingDocumentUseCase } from "./deleteBillingDocument.useCase";

export const createDeleteBillingDocumentUseCase = (
  repository: BillingRepository,
): DeleteBillingDocumentUseCase => ({
  execute(remoteId) {
    return repository.deleteBillingDocumentByRemoteId(remoteId);
  },
});
