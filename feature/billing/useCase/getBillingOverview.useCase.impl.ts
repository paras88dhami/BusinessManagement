import { BillingRepository } from "@/feature/billing/data/repository/billing.repository";
import { GetBillingOverviewUseCase } from "./getBillingOverview.useCase";

export const createGetBillingOverviewUseCase = (
  repository: BillingRepository,
): GetBillingOverviewUseCase => ({
  execute(accountRemoteId: string) {
    return repository.getBillingOverviewByAccountRemoteId(accountRemoteId);
  },
});
