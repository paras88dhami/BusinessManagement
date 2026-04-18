import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import {
    MoneyAccount,
    MoneyAccountErrorType,
    MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { createRunMoneyAccountBalanceReconciliationWorkflowUseCase } from "@/feature/accounts/workflow/moneyAccountBalanceReconciliation/useCase/runMoneyAccountBalanceReconciliation.useCase.impl";
import {
    TransactionDirection,
    TransactionPostingStatus,
    TransactionSourceModule,
    TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import { PostMoneyMovementUseCase } from "@/feature/transactions/useCase/postMoneyMovement.useCase";
import { describe, expect, it, vi } from "vitest";

const buildAccount = (overrides: Partial<MoneyAccount> = {}): MoneyAccount => ({
  remoteId: "cash-1",
  ownerUserRemoteId: "user-1",
  scopeAccountRemoteId: "business-1",
  name: "Cash Drawer",
  type: MoneyAccountType.Cash,
  currentBalance: 125,
  description: null,
  currencyCode: "NPR",
  isPrimary: true,
  isActive: true,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

const createRepository = (
  getMoneyAccountResponses: readonly MoneyAccount[],
): MoneyAccountRepository => {
  const queuedResponses = [...getMoneyAccountResponses];

  return {
    saveMoneyAccount: vi.fn(),
    getMoneyAccountsByScopeAccountRemoteId: vi.fn(),
    getMoneyAccountByRemoteId: vi.fn(async () => {
      const nextResponse = queuedResponses.shift();

      return nextResponse
        ? {
            success: true as const,
            value: nextResponse,
          }
        : {
            success: false as const,
            error: {
              type: MoneyAccountErrorType.MoneyAccountNotFound,
              message: "The requested money account was not found.",
            },
          };
    }),
    archiveMoneyAccountByRemoteId: vi.fn(),
  };
};

const createPostMoneyMovementUseCase = (): PostMoneyMovementUseCase => ({
  execute: vi.fn(async (payload) => ({
    success: true as const,
    value: {
      ...payload,
      settlementMoneyAccountRemoteId:
        payload.settlementMoneyAccountRemoteId ?? null,
      settlementMoneyAccountDisplayNameSnapshot:
        payload.settlementMoneyAccountDisplayNameSnapshot ?? null,
      sourceModule: payload.sourceModule ?? TransactionSourceModule.Manual,
      sourceRemoteId: payload.sourceRemoteId ?? null,
      sourceAction: payload.sourceAction ?? null,
      idempotencyKey: payload.idempotencyKey ?? null,
      postingStatus: payload.postingStatus ?? TransactionPostingStatus.Posted,
      contactRemoteId: payload.contactRemoteId ?? null,
      createdAt: 1,
      updatedAt: 1,
    },
  })),
});

describe("runMoneyAccountBalanceReconciliation workflow", () => {
  it("posts an income correction when counted balance is higher", async () => {
    const repository = createRepository([
      buildAccount({ currentBalance: 125 }),
      buildAccount({ currentBalance: 150 }),
    ]);
    const postMoneyMovementUseCase = createPostMoneyMovementUseCase();

    const useCase = createRunMoneyAccountBalanceReconciliationWorkflowUseCase({
      moneyAccountRepository: repository,
      postMoneyMovementUseCase,
    });

    const result = await useCase.execute({
      ownerUserRemoteId: "user-1",
      scopeAccountRemoteId: "business-1",
      scopeAccountDisplayNameSnapshot: "Main Business",
      moneyAccountRemoteId: "cash-1",
      targetBalance: 150,
      reason: "Cash counted at closing",
      adjustedAt: 1_710_000_000_000,
    });

    expect(result.success).toBe(true);
    expect(postMoneyMovementUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 25,
        categoryLabel: "Balance Correction",
        direction: TransactionDirection.In,
        note: expect.stringContaining("Cash counted at closing"),
        settlementMoneyAccountRemoteId: "cash-1",
        sourceModule: TransactionSourceModule.MoneyAccounts,
        sourceAction: "balance_reconciliation",
        transactionType: TransactionType.Income,
      }),
    );
  });

  it("posts an expense correction when counted balance is lower", async () => {
    const repository = createRepository([
      buildAccount({ currentBalance: 125 }),
      buildAccount({ currentBalance: 100 }),
    ]);
    const postMoneyMovementUseCase = createPostMoneyMovementUseCase();

    const useCase = createRunMoneyAccountBalanceReconciliationWorkflowUseCase({
      moneyAccountRepository: repository,
      postMoneyMovementUseCase,
    });

    const result = await useCase.execute({
      ownerUserRemoteId: "user-1",
      scopeAccountRemoteId: "business-1",
      scopeAccountDisplayNameSnapshot: "Main Business",
      moneyAccountRemoteId: "cash-1",
      targetBalance: 100,
      reason: "Bank fee found on statement",
      adjustedAt: 1_710_000_000_000,
    });

    expect(result.success).toBe(true);
    expect(postMoneyMovementUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 25,
        direction: TransactionDirection.Out,
        transactionType: TransactionType.Expense,
      }),
    );
  });

  it("rejects no-op corrections without posting a transaction", async () => {
    const repository = createRepository([
      buildAccount({ currentBalance: 125 }),
    ]);
    const postMoneyMovementUseCase = createPostMoneyMovementUseCase();

    const useCase = createRunMoneyAccountBalanceReconciliationWorkflowUseCase({
      moneyAccountRepository: repository,
      postMoneyMovementUseCase,
    });

    const result = await useCase.execute({
      ownerUserRemoteId: "user-1",
      scopeAccountRemoteId: "business-1",
      scopeAccountDisplayNameSnapshot: "Main Business",
      moneyAccountRemoteId: "cash-1",
      targetBalance: 125,
      reason: "Counted cash",
      adjustedAt: 1_710_000_000_000,
    });

    expect(result.success).toBe(false);
    expect(postMoneyMovementUseCase.execute).not.toHaveBeenCalled();
  });
});
