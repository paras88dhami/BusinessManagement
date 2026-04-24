import {
  TransactionDirection,
  TransactionPostingStatus,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import { createRunMoneyPostingWorkflowUseCase } from "@/feature/transactions/workflow/moneyPosting/useCase/runMoneyPostingWorkflow.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const buildPayload = (overrides: Record<string, unknown> = {}) => ({
  remoteId: "txn-1",
  ownerUserRemoteId: "owner-1",
  accountRemoteId: "account-1",
  accountDisplayNameSnapshot: "Main Account",
  transactionType: TransactionType.Income,
  direction: TransactionDirection.In,
  title: "POS Sale",
  amount: 100,
  currencyCode: "NPR",
  categoryLabel: "POS",
  note: null,
  happenedAt: 1710000000000,
  settlementMoneyAccountRemoteId: "cash-1",
  settlementMoneyAccountDisplayNameSnapshot: "Cash",
  sourceModule: "pos",
  sourceRemoteId: "sale-1",
  sourceAction: "checkout",
  idempotencyKey: "idem-1",
  postingStatus: TransactionPostingStatus.Posted,
  contactRemoteId: null,
  ...overrides,
});

const buildExistingTransaction = (overrides: Record<string, unknown> = {}) => ({
  remoteId: "txn-1",
  ownerUserRemoteId: "owner-1",
  accountRemoteId: "account-1",
  accountDisplayNameSnapshot: "Main Account",
  transactionType: TransactionType.Income,
  direction: TransactionDirection.In,
  title: "POS Sale",
  amount: 100,
  currencyCode: "NPR",
  categoryLabel: "POS",
  note: null,
  happenedAt: 1710000000000,
  settlementMoneyAccountRemoteId: "cash-1",
  settlementMoneyAccountDisplayNameSnapshot: "Cash",
  sourceModule: null,
  sourceRemoteId: "sale-1",
  sourceAction: "checkout",
  idempotencyKey: "idem-1",
  postingStatus: TransactionPostingStatus.Posted,
  contactRemoteId: null,
  deletedAt: null,
  ...overrides,
});

describe("money posting audit", () => {
  it("postMoneyMovement emits money_movement_posted audit", async () => {
    const workflowRepository = {
      getTransactionByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: null,
      })),
      getActiveTransactionByIdempotencyKey: vi.fn(async () => ({
        success: true as const,
        value: null,
      })),
      applyPostMoneyMovementPlan: vi.fn(async () => ({
        success: true as const,
        value: buildExistingTransaction(),
      })),
      applyDeleteMoneyMovementPlan: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };
    const recordAuditEventUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {} as never,
      })),
    };
    const useCase = createRunMoneyPostingWorkflowUseCase({
      workflowRepository: workflowRepository as never,
      recordAuditEventUseCase: recordAuditEventUseCase as never,
    });

    const result = await useCase.postMoneyMovement(buildPayload() as never);

    expect(result.success).toBe(true);
    expect(recordAuditEventUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        module: "transactions",
        action: "money_movement_posted",
        sourceRemoteId: "txn-1",
      }),
    );
  });

  it("deleteMoneyMovementByRemoteId emits money_movement_voided audit", async () => {
    const workflowRepository = {
      getTransactionByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: buildExistingTransaction(),
      })),
      getActiveTransactionByIdempotencyKey: vi.fn(async () => ({
        success: true as const,
        value: null,
      })),
      applyPostMoneyMovementPlan: vi.fn(async () => ({
        success: true as const,
        value: buildExistingTransaction(),
      })),
      applyDeleteMoneyMovementPlan: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };
    const recordAuditEventUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {} as never,
      })),
    };
    const useCase = createRunMoneyPostingWorkflowUseCase({
      workflowRepository: workflowRepository as never,
      recordAuditEventUseCase: recordAuditEventUseCase as never,
    });

    const result = await useCase.deleteMoneyMovementByRemoteId("txn-1");

    expect(result.success).toBe(true);
    expect(recordAuditEventUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        module: "transactions",
        action: "money_movement_voided",
        sourceAction: "void_money_movement",
      }),
    );
  });

  it("audit failure after money mutation returns failure, not fake success", async () => {
    const workflowRepository = {
      getTransactionByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: null,
      })),
      getActiveTransactionByIdempotencyKey: vi.fn(async () => ({
        success: true as const,
        value: null,
      })),
      applyPostMoneyMovementPlan: vi.fn(async () => ({
        success: true as const,
        value: buildExistingTransaction(),
      })),
      applyDeleteMoneyMovementPlan: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };
    const recordAuditEventUseCase = {
      execute: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "DATABASE",
          message: "Unable to save audit event.",
        },
      })),
    };
    const useCase = createRunMoneyPostingWorkflowUseCase({
      workflowRepository: workflowRepository as never,
      recordAuditEventUseCase: recordAuditEventUseCase as never,
    });

    const result = await useCase.postMoneyMovement(buildPayload() as never);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain(
        "Money movement posted, but audit event failed:",
      );
    }
  });
});
