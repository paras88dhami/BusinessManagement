import {
  MoneyAccount,
  MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { createAdjustMoneyAccountBalanceUseCase } from "@/feature/accounts/useCase/adjustMoneyAccountBalance.useCase.impl";
import { RunMoneyAccountBalanceReconciliationWorkflowUseCase } from "@/feature/accounts/workflow/moneyAccountBalanceReconciliation/useCase/runMoneyAccountBalanceReconciliation.useCase";
import { describe, expect, it, vi } from "vitest";

const buildAccount = (overrides: Partial<MoneyAccount> = {}): MoneyAccount => ({
  remoteId: "cash-1",
  ownerUserRemoteId: "user-1",
  scopeAccountRemoteId: "business-1",
  name: "Cash Drawer",
  type: MoneyAccountType.Cash,
  currentBalance: 150,
  description: null,
  currencyCode: "NPR",
  isPrimary: true,
  isActive: true,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

describe("adjustMoneyAccountBalance use case", () => {
  it("delegates cross-domain reconciliation into the workflow boundary", async () => {
    const runMoneyAccountBalanceReconciliationWorkflowUseCase: RunMoneyAccountBalanceReconciliationWorkflowUseCase =
      {
        execute: vi.fn(async () => ({
          success: true as const,
          value: buildAccount(),
        })),
      };

    const useCase = createAdjustMoneyAccountBalanceUseCase({
      runMoneyAccountBalanceReconciliationWorkflowUseCase,
    });

    const payload = {
      ownerUserRemoteId: "user-1",
      scopeAccountRemoteId: "business-1",
      scopeAccountDisplayNameSnapshot: "Main Business",
      moneyAccountRemoteId: "cash-1",
      targetBalance: 150,
      reason: "Cash counted at closing",
      adjustedAt: 1_710_000_000_000,
    };

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
    expect(
      runMoneyAccountBalanceReconciliationWorkflowUseCase.execute,
    ).toHaveBeenCalledWith(payload);
  });
});
