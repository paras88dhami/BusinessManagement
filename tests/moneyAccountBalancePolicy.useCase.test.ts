import { describe, expect, it, vi } from "vitest";
import { createSaveMoneyAccountUseCase } from "@/feature/accounts/useCase/saveMoneyAccount.useCase.impl";
import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import {
  MoneyAccount,
  MoneyAccountErrorType,
  MoneyAccountType,
  SaveMoneyAccountPayload,
} from "@/feature/accounts/types/moneyAccount.types";
import { PostMoneyMovementUseCase } from "@/feature/transactions/useCase/postMoneyMovement.useCase";
import {
  TransactionDirection,
  TransactionPostingStatus,
  TransactionSourceModule,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";

const buildPayload = (
  overrides: Partial<SaveMoneyAccountPayload> = {},
): SaveMoneyAccountPayload => ({
  remoteId: "cash-1",
  ownerUserRemoteId: "user-1",
  scopeAccountRemoteId: "business-1",
  scopeAccountDisplayNameSnapshot: "Main Business",
  name: "Cash Drawer",
  type: MoneyAccountType.Cash,
  currentBalance: 500,
  description: null,
  currencyCode: "NPR",
  isPrimary: true,
  isActive: true,
  ...overrides,
});

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
  getMoneyAccountResponses: readonly (MoneyAccount | null)[],
): MoneyAccountRepository => {
  const queuedResponses = [...getMoneyAccountResponses];

  return {
    saveMoneyAccount: vi.fn(async (payload: SaveMoneyAccountPayload) => ({
      success: true as const,
      value: buildAccount({
        ...payload,
        currentBalance: payload.currentBalance,
        createdAt: 1,
        updatedAt: 2,
      }),
    })),
    getMoneyAccountsByScopeAccountRemoteId: vi.fn(),
    getMoneyAccountByRemoteId: vi.fn(async () => {
      const nextResponse = queuedResponses.shift() ?? null;

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
      createdAt: 1,
      updatedAt: 1,
    },
  })),
});

describe("money account balance policy", () => {
  it("uses create-time balance as the opening balance seed for new money accounts", async () => {
    const repository = createRepository([
      null,
      buildAccount({
        currentBalance: 750,
      }),
    ]);
    const postMoneyMovementUseCase = createPostMoneyMovementUseCase();
    const useCase = createSaveMoneyAccountUseCase({
      repository,
      postMoneyMovementUseCase,
    });

    const result = await useCase.execute(
      buildPayload({
        currentBalance: 750,
      }),
    );

    expect(result.success).toBe(true);
    expect(repository.saveMoneyAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteId: "cash-1",
        currentBalance: 0,
      }),
    );
    expect(postMoneyMovementUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        accountDisplayNameSnapshot: "Main Business",
        amount: 750,
        categoryLabel: "Opening Balance",
        direction: TransactionDirection.In,
        settlementMoneyAccountRemoteId: "cash-1",
        sourceModule: TransactionSourceModule.MoneyAccounts,
        sourceAction: "opening_balance",
        transactionType: TransactionType.Income,
      }),
    );
  });

  it("preserves existing current balance when account details are edited", async () => {
    const repository = createRepository([
      buildAccount({
        currentBalance: 125,
      }),
    ]);
    const postMoneyMovementUseCase = createPostMoneyMovementUseCase();
    const useCase = createSaveMoneyAccountUseCase({
      repository,
      postMoneyMovementUseCase,
    });

    const result = await useCase.execute(
      buildPayload({
        name: "Front Counter Cash",
        currentBalance: 999,
      }),
    );

    expect(result.success).toBe(true);
    expect(repository.saveMoneyAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Front Counter Cash",
        currentBalance: 125,
      }),
    );
    expect(postMoneyMovementUseCase.execute).not.toHaveBeenCalled();
  });
});
