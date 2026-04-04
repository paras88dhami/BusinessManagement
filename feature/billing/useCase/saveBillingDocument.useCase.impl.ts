import { BillingRepository } from "@/feature/billing/data/repository/billing.repository";
import { SaveBillingDocumentUseCase } from "./saveBillingDocument.useCase";

export const createSaveBillingDocumentUseCase = (
  repository: BillingRepository,
): SaveBillingDocumentUseCase => ({
  execute(payload) {
    return repository.saveBillingDocument(payload);
  },
});
