import { BillingRepository } from "@/feature/billing/data/repository/billing.repository";
import {
  LinkBillingDocumentContactPayload,
  LinkBillingDocumentContactUseCase,
} from "@/feature/billing/useCase/linkBillingDocumentContact.useCase";

export const createLinkBillingDocumentContactUseCase = (
  repository: BillingRepository,
): LinkBillingDocumentContactUseCase => ({
  execute(payload: LinkBillingDocumentContactPayload) {
    return repository.linkBillingDocumentContactRemoteId(
      payload.billingDocumentRemoteId,
      payload.contactRemoteId,
    );
  },
});
