import { describe, expect, it, vi } from "vitest";
import { createPayEmiInstallmentUseCase } from "@/feature/emiLoans/useCase/payEmiInstallment.useCase.impl";
import { EmiRepository } from "@/feature/emiLoans/data/repository/emi.repository";
import { TransactionRepository } from "@/feature/transactions/data/repository/transaction.repository";
import { LedgerRepository } from "@/feature/ledger/data/repository/ledger.repository";
import {
  EmiInstallmentStatus,
  EmiPaymentDirection,
  EmiPlanMode,
  EmiPlanStatus,
  EmiPlanType,
} from "@/feature/emiLoans/types/emi.entity.types";

describe("payEmiInstallment.useCase", () => {
  it("rolls back personal transaction when EMI completion fails", async () => {
    const emiRepository = {
      getPlanDetailByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          plan: {
            remoteId: "plan-1",
            ownerUserRemoteId: "user-1",
            businessAccountRemoteId: null,
            planMode: EmiPlanMode.Personal,
            planType: EmiPlanType.MyEmi,
            paymentDirection: EmiPaymentDirection.Pay,
            title: "Phone EMI",
            counterpartyName: "Bank",
            counterpartyPhone: null,
            linkedAccountRemoteId: "account-1",
            linkedAccountDisplayNameSnapshot: "Personal Account",
            currencyCode: "NPR",
            totalAmount: 10000,
            installmentCount: 10,
            paidInstallmentCount: 0,
            paidAmount: 0,
            firstDueAt: 1,
            nextDueAt: 1,
            reminderEnabled: true,
            reminderDaysBefore: 1,
            note: null,
            status: EmiPlanStatus.Active,
            createdAt: 1,
            updatedAt: 1,
          },
          installments: [
            {
              remoteId: "inst-1",
              planRemoteId: "plan-1",
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
      })),
      completeInstallmentPayment: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "UNKNOWN_ERROR" as const,
          message: "EMI update failed",
        },
      })),
    };

    const transactionRepository = {
      saveTransaction: vi.fn(async () => ({
        success: true as const,
        value: { remoteId: "txn-1" },
      })),
      deleteTransactionByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };

    const ledgerRepository = {
      saveLedgerEntry: vi.fn(async () => ({
        success: true as const,
        value: { remoteId: "led-1" },
      })),
      deleteLedgerEntryByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };

    const useCase = createPayEmiInstallmentUseCase(
      emiRepository as unknown as EmiRepository,
      transactionRepository as unknown as TransactionRepository,
      ledgerRepository as unknown as LedgerRepository,
    );

    const result = await useCase.execute({
      planRemoteId: "plan-1",
      installmentRemoteId: "inst-1",
      paidAt: 100,
    });

    expect(result.success).toBe(false);
    expect(transactionRepository.saveTransaction).toHaveBeenCalledTimes(1);
    expect(transactionRepository.deleteTransactionByRemoteId).toHaveBeenCalledTimes(1);
    expect(ledgerRepository.saveLedgerEntry).not.toHaveBeenCalled();
  });

  it("returns rollback error details when business rollback fails", async () => {
    const emiRepository = {
      getPlanDetailByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          plan: {
            remoteId: "plan-2",
            ownerUserRemoteId: "user-1",
            businessAccountRemoteId: "business-1",
            planMode: EmiPlanMode.Business,
            planType: EmiPlanType.BusinessLoan,
            paymentDirection: EmiPaymentDirection.Pay,
            title: "Machine Loan",
            counterpartyName: "Vendor",
            counterpartyPhone: "9800000000",
            linkedAccountRemoteId: "business-1",
            linkedAccountDisplayNameSnapshot: "Shop Account",
            currencyCode: "NPR",
            totalAmount: 12000,
            installmentCount: 12,
            paidInstallmentCount: 0,
            paidAmount: 0,
            firstDueAt: 1,
            nextDueAt: 1,
            reminderEnabled: true,
            reminderDaysBefore: 1,
            note: null,
            status: EmiPlanStatus.Active,
            createdAt: 1,
            updatedAt: 1,
          },
          installments: [
            {
              remoteId: "inst-2",
              planRemoteId: "plan-2",
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
      })),
      completeInstallmentPayment: vi.fn(async () => ({
        success: true as const,
        value: false,
      })),
    };

    const transactionRepository = {
      saveTransaction: vi.fn(async () => ({
        success: true as const,
        value: { remoteId: "txn-1" },
      })),
      deleteTransactionByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };

    const ledgerRepository = {
      saveLedgerEntry: vi.fn(async () => ({
        success: true as const,
        value: { remoteId: "led-1" },
      })),
      deleteLedgerEntryByRemoteId: vi.fn(async () => ({
        success: false as const,
        error: { message: "Delete failed" },
      })),
    };

    const useCase = createPayEmiInstallmentUseCase(
      emiRepository as unknown as EmiRepository,
      transactionRepository as unknown as TransactionRepository,
      ledgerRepository as unknown as LedgerRepository,
    );

    const result = await useCase.execute({
      planRemoteId: "plan-2",
      installmentRemoteId: "inst-2",
      paidAt: 100,
    });

    expect(result.success).toBe(false);
    expect(ledgerRepository.saveLedgerEntry).toHaveBeenCalledTimes(1);
    expect(ledgerRepository.deleteLedgerEntryByRemoteId).toHaveBeenCalledTimes(1);

    if (!result.success) {
      expect(result.error.message).toContain("Rollback failed");
    }
  });
});
