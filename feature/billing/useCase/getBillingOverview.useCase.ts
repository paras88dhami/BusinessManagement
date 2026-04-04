import { BillingOverviewResult } from "@/feature/billing/types/billing.types";

export interface GetBillingOverviewUseCase {
  execute(accountRemoteId: string): Promise<BillingOverviewResult>;
}
