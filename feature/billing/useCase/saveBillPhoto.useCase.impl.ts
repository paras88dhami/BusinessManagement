import { BillingRepository } from "@/feature/billing/data/repository/billing.repository";
import { SaveBillPhotoUseCase } from "./saveBillPhoto.useCase";

export const createSaveBillPhotoUseCase = (
  repository: BillingRepository,
): SaveBillPhotoUseCase => ({
  execute(payload) {
    return repository.saveBillPhoto(payload);
  },
});
