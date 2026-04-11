import { EmiOperationResult } from "@/feature/emiLoans/types/emi.entity.types";

export type PayEmiInstallmentInput = {
  planRemoteId: string;
  installmentRemoteId: string;
  paidAt: number;
  selectedSettlementAccountRemoteId: string;
};

export interface PayEmiInstallmentUseCase {
  execute(input: PayEmiInstallmentInput): Promise<EmiOperationResult>;
}
