import { describe, expect, it, vi } from "vitest";
import { MoneyAccountType } from "@/feature/accounts/types/moneyAccount.types";
import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { DeleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase } from "@/feature/billing/useCase/deleteBillingDocumentAllocationsBySettlementEntryRemoteId.useCase";
import { EmiRepository } from "@/feature/emiLoans/data/repository/emi.repository";
import { createPayEmiInstallmentUseCase } from "@/feature/emiLoans/useCase/payEmiInstallment.useCase.impl";
import {
  EmiInstallmentStatus,
  EmiPaymentDirection,
  EmiPlanMode,
  EmiPlanStatus,
  EmiPlanType,
} from "@/feature/emiLoans/types/emi.entity.types";
import { DeleteLedgerEntryUseCase } from "@/feature/ledger/useCase/deleteLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { SaveLedgerEntryWithSettlementUseCase } from "@/feature/ledger/useCase/saveLedgerEntryWithSettlement.useCase";
import { TransactionSourceModule } from "@/feature/transactions/types/transaction.entity.types";
import { DeleteBusinessTransactionUseCase } from "@/feature/transactions/useCase/deleteBusinessTransaction.useCase";
import { PostBusinessTransactionUseCase } from "@/feature/transactions/useCase/postBusinessTransaction.useCase";

const buildMoneyAccount = (remoteId: string, scopeAccountRemoteId: string) => ({
  remoteId,
  ownerUserRemoteId: "user-1",
  scopeAccountRemoteId,
  name: remoteId === "bank-1" ? "Main Bank" : "Cash Drawer",
  type: remoteId === "bank-1" ? MoneyAccountType.Bank : MoneyAccountType.Cash,
  currentBalance: 0,
  description: null,
  currencyCode: "NPR",
  isPrimary: true,
  isActive: true,
  createdAt: 1,
  updatedAt: 1,
});

const buildPlanDetail = (params: {
  planRemoteId: string;
  planMode: typeof EmiPlanMode[keyof typeof EmiPlanMode];
  paymentDirection: typeof EmiPaymentDirection[keyof typeof EmiPaymentDirection];
  linkedAccountRemoteId: string;
  businessAccountRemoteId?: string | null;
}) => ({
  success: true as const,
  value: {
    plan: {
      remoteId: params.planRemoteId,
      ownerUserRemoteId: "user-1",
      businessAccountRemoteId: params.businessAccountRemoteId ?? null,
      planMode: params.planMode,
      planType:
        params.planMode === EmiPlanMode.Business
          ? EmiPlanType.BusinessLoan
          : EmiPlanType.MyEmi,
      paymentDirection: params.paymentDirection,
      title: "EMI Plan",
      counterpartyName: "Counterparty",
      counterpartyPhone: "9800000000",
      linkedAccountRemoteId: params.linkedAccountRemoteId,
      linkedAccountDisplayNameSnapshot: "Main Business",
      currencyCode: "NPR",
      totalAmount: 10000,
      installmentCount: 10,
      paidInstallmentCount: 0,
      paidAmount: 0,
      firstDueAt: 1,
      nextDueAt: 1,
      reminderEnabled: true,
      reminderDaysBefore: 1,
      note: "EMI note",
      status: EmiPlanStatus.Active,
      createdAt: 1,
      updatedAt: 1,
    },
    installments: [
      {
        remoteId: "inst-1",
        planRemoteId: params.planRemoteId,
        installmentNumber: 1,
        amount: 1000,
        dueAt: 1,
        status: EmiInstallmentStatus.Pending,
        paidAt: null,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
  },
});

const createUseCase = (overrides?: {
  emiRepository?: Partial<EmiRepository>;
  getMoneyAccountsUseCase?: Partial<GetMoneyAccountsUseCase>;
  postBusinessTransactionUseCase?: Partial<PostBusinessTransactionUseCase>;
  deleteBusinessTransactionUseCase?: Partial<DeleteBusinessTransactionUseCase>;
  getLedgerEntriesUseCase?: Partial<GetLedgerEntriesUseCase>;
  saveLedgerEntryWithSettlementUseCase?: Partial<SaveLedgerEntryWithSettlementUseCase>;
  deleteLedgerEntryUseCase?: Partial<DeleteLedgerEntryUseCase>;
  deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase?: Partial<DeleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase>;
}) => {
  const emiRepository = {
    getPlanDetailByRemoteId: vi.fn(async () =>
      buildPlanDetail({
        planRemoteId: "plan-1",
        planMode: EmiPlanMode.Personal,
        paymentDirection: EmiPaymentDirection.Pay,
        linkedAccountRemoteId: "personal-account-1",
      }),
    ),
    completeInstallmentPayment: vi.fn(async () => ({
      success: false as const,
      error: {
        type: "UNKNOWN_ERROR" as const,
        message: "EMI update failed",
      },
    })),
    ...overrides?.emiRepository,
  };

  const getMoneyAccountsUseCase = {
    execute: vi.fn(async (_scopeAccountRemoteId: string) => ({
      success: true as const,
      value: [buildMoneyAccount("cash-1", "personal-account-1")],
    })),
    ...overrides?.getMoneyAccountsUseCase,
  };

  const postBusinessTransactionUseCase = {
    execute: vi.fn(async (payload: any) => ({
      success: true as const,
      value: {
        ...payload,
        settlementMoneyAccountRemoteId:
          payload.settlementMoneyAccountRemoteId ?? null,
        settlementMoneyAccountDisplayNameSnapshot:
          payload.settlementMoneyAccountDisplayNameSnapshot ?? null,
        sourceModule: payload.sourceModule ?? null,
        sourceRemoteId: payload.sourceRemoteId ?? null,
        sourceAction: payload.sourceAction ?? null,
        idempotencyKey: payload.idempotencyKey ?? null,
        postingStatus: "posted" as const,
        createdAt: 1,
        updatedAt: 1,
      },
    })),
    ...overrides?.postBusinessTransactionUseCase,
  };

  const deleteBusinessTransactionUseCase = {
    execute: vi.fn(async (_remoteId: string) => ({
      success: true as const,
      value: true,
    })),
    ...overrides?.deleteBusinessTransactionUseCase,
  };

  const getLedgerEntriesUseCase = {
    execute: vi.fn(async (_params: { businessAccountRemoteId: string }) => ({
      success: true as const,
      value: [],
    })),
    ...overrides?.getLedgerEntriesUseCase,
  };

  const saveLedgerEntryWithSettlementUseCase = {
    execute: vi.fn(async (payload: any) => ({
      success: true as const,
      value: {
        ...payload.ledgerEntry,
        linkedTransactionRemoteId: "txn-linked-1",
        settlementAccountRemoteId: "bank-1",
        settlementAccountDisplayNameSnapshot: "Main Bank",
        createdAt: 1,
        updatedAt: 1,
      },
    })),
    ...overrides?.saveLedgerEntryWithSettlementUseCase,
  };

  const deleteLedgerEntryUseCase = {
    execute: vi.fn(async (_remoteId: string) => ({
      success: true as const,
      value: true,
    })),
    ...overrides?.deleteLedgerEntryUseCase,
  };

  const deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase = {
    execute: vi.fn(async (_settlementLedgerEntryRemoteId: string) => ({
      success: true as const,
      value: true,
    })),
    ...overrides?.deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase,
  };

  return {
    useCase: createPayEmiInstallmentUseCase(
      emiRepository as unknown as EmiRepository,
      getMoneyAccountsUseCase as unknown as GetMoneyAccountsUseCase,
      postBusinessTransactionUseCase as unknown as PostBusinessTransactionUseCase,
      deleteBusinessTransactionUseCase as unknown as DeleteBusinessTransactionUseCase,
      getLedgerEntriesUseCase as unknown as GetLedgerEntriesUseCase,
      saveLedgerEntryWithSettlementUseCase as unknown as SaveLedgerEntryWithSettlementUseCase,
      deleteLedgerEntryUseCase as unknown as DeleteLedgerEntryUseCase,
      deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase as unknown as DeleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase,
    ),
    emiRepository,
    getMoneyAccountsUseCase,
    postBusinessTransactionUseCase,
    deleteBusinessTransactionUseCase,
    getLedgerEntriesUseCase,
    saveLedgerEntryWithSettlementUseCase,
    deleteLedgerEntryUseCase,
    deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase,
  };
};

describe("payEmiInstallment.useCase", () => {
  it("rolls back personal posting through shared business transaction deletion", async () => {
    const {
      useCase,
      postBusinessTransactionUseCase,
      deleteBusinessTransactionUseCase,
      saveLedgerEntryWithSettlementUseCase,
    } = createUseCase();

    const result = await useCase.execute({
      planRemoteId: "plan-1",
      installmentRemoteId: "inst-1",
      paidAt: 100,
      selectedSettlementAccountRemoteId: "cash-1",
    });

    expect(result.success).toBe(false);
    expect(postBusinessTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    expect(postBusinessTransactionUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        accountRemoteId: "personal-account-1",
        settlementMoneyAccountRemoteId: "cash-1",
        settlementMoneyAccountDisplayNameSnapshot: "Cash Drawer",
        sourceModule: TransactionSourceModule.Emi,
        sourceRemoteId: "plan-1",
        sourceAction: "installment_payment",
      }),
    );

    const postedPayload = (
      postBusinessTransactionUseCase.execute as any
    ).mock.calls[0][0];

    expect(deleteBusinessTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    expect(deleteBusinessTransactionUseCase.execute).toHaveBeenCalledWith(
      postedPayload.remoteId,
    );
    expect(saveLedgerEntryWithSettlementUseCase.execute).not.toHaveBeenCalled();
  });

  it("routes business EMI payments through ledger settlement and reports rollback failures", async () => {
    const {
      useCase,
      getMoneyAccountsUseCase,
      getLedgerEntriesUseCase,
      saveLedgerEntryWithSettlementUseCase,
      deleteLedgerEntryUseCase,
      deleteBusinessTransactionUseCase,
      deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase,
    } = createUseCase({
      emiRepository: {
        getPlanDetailByRemoteId: vi.fn(async () =>
          buildPlanDetail({
            planRemoteId: "plan-2",
            planMode: EmiPlanMode.Business,
            paymentDirection: EmiPaymentDirection.Pay,
            linkedAccountRemoteId: "business-1",
            businessAccountRemoteId: "business-1",
          }),
        ),
        completeInstallmentPayment: vi.fn(async () => ({
          success: true as const,
          value: false,
        })),
      },
      getMoneyAccountsUseCase: {
        execute: vi.fn(async (_scopeAccountRemoteId: string) => ({
          success: true as const,
          value: [buildMoneyAccount("bank-1", "business-1")],
        })),
      },
      saveLedgerEntryWithSettlementUseCase: {
        execute: vi.fn(async (payload: any) => ({
          success: true as const,
          value: {
            ...payload.ledgerEntry,
            remoteId: "ledger-emi-1",
            linkedTransactionRemoteId: "txn-linked-1",
            settlementAccountRemoteId: "bank-1",
            settlementAccountDisplayNameSnapshot: "Main Bank",
            createdAt: 1,
            updatedAt: 1,
          },
        })),
      },
      deleteLedgerEntryUseCase: {
        execute: vi.fn(async (_remoteId: string) => ({
          success: false as const,
          error: {
            type: "UNKNOWN_ERROR" as const,
            message: "Delete failed",
          },
        })),
      },
    });

    const result = await useCase.execute({
      planRemoteId: "plan-2",
      installmentRemoteId: "inst-1",
      paidAt: 100,
      selectedSettlementAccountRemoteId: "bank-1",
    });

    expect(result.success).toBe(false);
    expect(getMoneyAccountsUseCase.execute).toHaveBeenCalledWith("business-1");
    expect(getLedgerEntriesUseCase.execute).toHaveBeenCalledWith({
      businessAccountRemoteId: "business-1",
    });
    expect(saveLedgerEntryWithSettlementUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "create",
        selectedSettlementAccountRemoteId: "bank-1",
        ledgerEntry: expect.objectContaining({
          businessAccountRemoteId: "business-1",
          linkedTransactionRemoteId: null,
        }),
      }),
    );
    expect(deleteLedgerEntryUseCase.execute).toHaveBeenCalledWith("ledger-emi-1");
    expect(deleteBusinessTransactionUseCase.execute).toHaveBeenCalledWith(
      "txn-linked-1",
    );
    expect(
      deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase.execute,
    ).toHaveBeenCalledWith("ledger-emi-1");

    if (!result.success) {
      expect(result.error.message).toContain("Ledger rollback failed: Delete failed");
    }
  });

  it("stops before posting when the selected money account is not valid for the EMI scope", async () => {
    const {
      useCase,
      emiRepository,
      postBusinessTransactionUseCase,
      saveLedgerEntryWithSettlementUseCase,
    } = createUseCase();

    const result = await useCase.execute({
      planRemoteId: "plan-1",
      installmentRemoteId: "inst-1",
      paidAt: 100,
      selectedSettlementAccountRemoteId: "bank-404",
    });

    expect(result.success).toBe(false);
    expect(postBusinessTransactionUseCase.execute).not.toHaveBeenCalled();
    expect(saveLedgerEntryWithSettlementUseCase.execute).not.toHaveBeenCalled();
    expect(emiRepository.completeInstallmentPayment).not.toHaveBeenCalled();

    if (!result.success) {
      expect(result.error.message).toBe("Choose a valid active money account.");
    }
  });
});
