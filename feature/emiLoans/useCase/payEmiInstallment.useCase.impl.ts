import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { DeleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase } from "@/feature/billing/useCase/deleteBillingDocumentAllocationsBySettlementEntryRemoteId.useCase";
import { EmiRepository } from "@/feature/emiLoans/data/repository/emi.repository";
import {
  EmiPaymentDirection,
  EmiPlan,
  EmiPlanMode,
  InstallmentPaymentRecordType,
} from "@/feature/emiLoans/types/emi.entity.types";
import {
  EmiAlreadyPaidError,
  EmiInstallmentNotFoundError,
  EmiValidationError,
} from "@/feature/emiLoans/types/emi.error.types";
import { createLocalRemoteId } from "@/feature/emiLoans/viewModel/emi.shared";
import { DeleteLedgerEntryUseCase } from "@/feature/ledger/useCase/deleteLedgerEntry.useCase";
import {
  INVALID_LEDGER_SETTLEMENT_ACCOUNT_MESSAGE,
  SaveLedgerEntryWithSettlementUseCase,
} from "@/feature/ledger/useCase/saveLedgerEntryWithSettlement.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import {
  LedgerBalanceDirection,
  LedgerEntryType,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  TransactionDirection,
  TransactionSourceModule,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import { DeleteBusinessTransactionUseCase } from "@/feature/transactions/useCase/deleteBusinessTransaction.useCase";
import { PostBusinessTransactionUseCase } from "@/feature/transactions/useCase/postBusinessTransaction.useCase";
import { PayEmiInstallmentUseCase } from "./payEmiInstallment.useCase";

const resolveScopeAccountRemoteId = (plan: EmiPlan): string => {
  const businessAccountRemoteId = plan.businessAccountRemoteId?.trim() ?? "";
  return businessAccountRemoteId.length > 0
    ? businessAccountRemoteId
    : plan.linkedAccountRemoteId.trim();
};

const resolveSettlementAccount = async ({
  getMoneyAccountsUseCase,
  plan,
  selectedSettlementAccountRemoteId,
}: {
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  plan: EmiPlan;
  selectedSettlementAccountRemoteId: string;
}) => {
  const moneyAccountsResult = await getMoneyAccountsUseCase.execute(
    resolveScopeAccountRemoteId(plan),
  );

  if (!moneyAccountsResult.success) {
    return {
      success: false as const,
      error: {
        type: "UNKNOWN_ERROR" as const,
        message: moneyAccountsResult.error.message,
      },
    };
  }

  const settlementMoneyAccount = moneyAccountsResult.value
    .filter((moneyAccount) => moneyAccount.isActive)
    .find(
      (moneyAccount) =>
        moneyAccount.remoteId === selectedSettlementAccountRemoteId,
    );

  if (!settlementMoneyAccount) {
    return {
      success: false as const,
      error: EmiValidationError(INVALID_LEDGER_SETTLEMENT_ACCOUNT_MESSAGE),
    };
  }

  return {
    success: true as const,
    value: settlementMoneyAccount,
  };
};

const collectRollbackErrors = (
  rollbackErrors: readonly string[],
): string | null => {
  if (rollbackErrors.length === 0) {
    return null;
  }

  return rollbackErrors.join(" ");
};

export const createPayEmiInstallmentUseCase = (
  emiRepository: EmiRepository,
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase,
  postBusinessTransactionUseCase: PostBusinessTransactionUseCase,
  deleteBusinessTransactionUseCase: DeleteBusinessTransactionUseCase,
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase,
  saveLedgerEntryWithSettlementUseCase: SaveLedgerEntryWithSettlementUseCase,
  deleteLedgerEntryUseCase: DeleteLedgerEntryUseCase,
  deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase: DeleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase,
): PayEmiInstallmentUseCase => ({
  async execute({
    planRemoteId,
    installmentRemoteId,
    paidAt,
    selectedSettlementAccountRemoteId,
  }) {
    const normalizedPlanRemoteId = planRemoteId.trim();
    const normalizedInstallmentRemoteId = installmentRemoteId.trim();
    const normalizedSettlementAccountRemoteId =
      selectedSettlementAccountRemoteId.trim();

    if (!normalizedPlanRemoteId || !normalizedInstallmentRemoteId) {
      return {
        success: false,
        error: EmiValidationError("Plan and installment are required."),
      };
    }

    if (!normalizedSettlementAccountRemoteId) {
      return {
        success: false,
        error: EmiValidationError("Money account is required."),
      };
    }

    if (!Number.isFinite(paidAt) || paidAt <= 0) {
      return {
        success: false,
        error: EmiValidationError("A valid payment date is required."),
      };
    }

    const planDetailResult = await emiRepository.getPlanDetailByRemoteId(
      normalizedPlanRemoteId,
    );

    if (!planDetailResult.success) {
      return planDetailResult;
    }

    const installment = planDetailResult.value.installments.find(
      (entry) => entry.remoteId === normalizedInstallmentRemoteId,
    );

    if (!installment) {
      return { success: false, error: EmiInstallmentNotFoundError };
    }

    if (installment.status === "paid") {
      return { success: false, error: EmiAlreadyPaidError };
    }

    const { plan } = planDetailResult.value;
    const settlementAccountResult = await resolveSettlementAccount({
      getMoneyAccountsUseCase,
      plan,
      selectedSettlementAccountRemoteId: normalizedSettlementAccountRemoteId,
    });

    if (!settlementAccountResult.success) {
      return settlementAccountResult;
    }

    const settlementMoneyAccount = settlementAccountResult.value;
    const isCollection =
      plan.paymentDirection === EmiPaymentDirection.Collect;

    let paymentRecordType: "transaction" | "ledger";
    let paymentRecordRemoteId: string;
    let linkedTransactionRemoteId: string | null = null;

    if (plan.planMode === EmiPlanMode.Personal) {
      paymentRecordType = InstallmentPaymentRecordType.Transaction;
      paymentRecordRemoteId = createLocalRemoteId("txn_emi_payment");

      const transactionResult = await postBusinessTransactionUseCase.execute({
        remoteId: paymentRecordRemoteId,
        ownerUserRemoteId: plan.ownerUserRemoteId,
        accountRemoteId: plan.linkedAccountRemoteId,
        accountDisplayNameSnapshot: plan.linkedAccountDisplayNameSnapshot,
        transactionType: isCollection
          ? TransactionType.Income
          : TransactionType.Expense,
        direction: isCollection
          ? TransactionDirection.In
          : TransactionDirection.Out,
        title: `${plan.title} - Installment ${installment.installmentNumber}`,
        amount: installment.amount,
        currencyCode: plan.currencyCode,
        categoryLabel: "EMI Payment",
        note: plan.note,
        happenedAt: paidAt,
        settlementMoneyAccountRemoteId: settlementMoneyAccount.remoteId,
        settlementMoneyAccountDisplayNameSnapshot: settlementMoneyAccount.name,
        sourceModule: TransactionSourceModule.Emi,
        sourceRemoteId: normalizedPlanRemoteId,
        sourceAction: "installment_payment",
      });

      if (!transactionResult.success) {
        return {
          success: false,
          error: {
            type: "UNKNOWN_ERROR",
            message: transactionResult.error.message,
          },
        };
      }
    } else {
      paymentRecordType = InstallmentPaymentRecordType.Ledger;
      paymentRecordRemoteId = createLocalRemoteId("ledger_emi_payment");

      const businessAccountRemoteId = resolveScopeAccountRemoteId(plan);
      const existingLedgerEntriesResult =
        await getLedgerEntriesUseCase.execute({
          businessAccountRemoteId,
        });

      if (!existingLedgerEntriesResult.success) {
        return {
          success: false,
          error: {
            type: "UNKNOWN_ERROR",
            message: existingLedgerEntriesResult.error.message,
          },
        };
      }

      const ledgerResult =
        await saveLedgerEntryWithSettlementUseCase.execute({
          mode: "create",
          businessAccountDisplayName: plan.linkedAccountDisplayNameSnapshot,
          selectedSettlementAccountRemoteId:
            settlementMoneyAccount.remoteId,
          ledgerEntry: {
            remoteId: paymentRecordRemoteId,
            businessAccountRemoteId,
            ownerUserRemoteId: plan.ownerUserRemoteId,
            partyName: plan.counterpartyName || plan.title,
            partyPhone: plan.counterpartyPhone,
            contactRemoteId: null,
            entryType: isCollection
              ? LedgerEntryType.Collection
              : LedgerEntryType.PaymentOut,
            balanceDirection: isCollection
              ? LedgerBalanceDirection.Receive
              : LedgerBalanceDirection.Pay,
            title: `${plan.title} - Installment ${installment.installmentNumber}`,
            amount: installment.amount,
            currencyCode: plan.currencyCode,
            note: plan.note,
            happenedAt: paidAt,
            dueAt: null,
            paymentMode: null,
            referenceNumber: null,
            reminderAt: null,
            attachmentUri: null,
            settledAgainstEntryRemoteId: null,
            linkedDocumentRemoteId: null,
            linkedTransactionRemoteId: null,
            settlementAccountRemoteId: null,
            settlementAccountDisplayNameSnapshot: null,
          },
          existingLedgerEntries: existingLedgerEntriesResult.value,
          settlementCandidates: [],
        });

      if (!ledgerResult.success) {
        return {
          success: false,
          error: {
            type: "UNKNOWN_ERROR",
            message: ledgerResult.error.message,
          },
        };
      }

      paymentRecordRemoteId = ledgerResult.value.remoteId;
      linkedTransactionRemoteId = ledgerResult.value.linkedTransactionRemoteId;
    }

    const completePaymentResult = await emiRepository.completeInstallmentPayment({
      linkRemoteId: createLocalRemoteId("installment_link"),
      planRemoteId: normalizedPlanRemoteId,
      installmentRemoteId: normalizedInstallmentRemoteId,
      paymentRecordType,
      paymentRecordRemoteId,
      paymentDirection: plan.paymentDirection,
      amount: installment.amount,
      paidAt,
    });

    if (completePaymentResult.success && completePaymentResult.value) {
      return completePaymentResult;
    }

    const rollbackErrors: string[] = [];

    if (paymentRecordType === InstallmentPaymentRecordType.Transaction) {
      const rollbackResult =
        await deleteBusinessTransactionUseCase.execute(paymentRecordRemoteId);

      if (!rollbackResult.success) {
        rollbackErrors.push(
          `Rollback failed: ${rollbackResult.error.message}`,
        );
      } else if (!rollbackResult.value) {
        rollbackErrors.push("Payment record rollback was not confirmed.");
      }
    } else {
      const deleteLedgerResult = await deleteLedgerEntryUseCase.execute(
        paymentRecordRemoteId,
      );

      if (!deleteLedgerResult.success) {
        rollbackErrors.push(
          `Ledger rollback failed: ${deleteLedgerResult.error.message}`,
        );
      } else if (!deleteLedgerResult.value) {
        rollbackErrors.push("Ledger rollback was not confirmed.");
      }

      if (linkedTransactionRemoteId) {
        const deleteTransactionResult =
          await deleteBusinessTransactionUseCase.execute(
            linkedTransactionRemoteId,
          );

        if (!deleteTransactionResult.success) {
          rollbackErrors.push(
            `Transaction rollback failed: ${deleteTransactionResult.error.message}`,
          );
        } else if (!deleteTransactionResult.value) {
          rollbackErrors.push(
            "Linked transaction rollback was not confirmed.",
          );
        }
      }

      const deleteAllocationsResult =
        await deleteBillingDocumentAllocationsBySettlementEntryRemoteIdUseCase.execute(
          paymentRecordRemoteId,
        );

      if (!deleteAllocationsResult.success) {
        rollbackErrors.push(
          `Allocation rollback failed: ${deleteAllocationsResult.error.message}`,
        );
      }
    }

    const rollbackErrorMessage = collectRollbackErrors(rollbackErrors);

    if (!completePaymentResult.success) {
      if (!rollbackErrorMessage) {
        return completePaymentResult;
      }

      return {
        success: false,
        error: {
          type: "UNKNOWN_ERROR",
          message: `${completePaymentResult.error.message} ${rollbackErrorMessage}`,
        },
      };
    }

    return {
      success: false,
      error: EmiValidationError(
        rollbackErrorMessage
          ? `Unable to complete EMI payment. ${rollbackErrorMessage}`
          : "Unable to complete EMI payment.",
      ),
    };
  },
});
