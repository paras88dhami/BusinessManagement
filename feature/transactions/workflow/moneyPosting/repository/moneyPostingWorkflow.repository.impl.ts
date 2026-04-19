import { MoneyAccountBalanceDatasource } from "@/feature/transactions/data/dataSource/moneyAccountBalance.datasource";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { MoneyPostingDatasource } from "@/feature/transactions/data/dataSource/moneyPosting.datasource";
import { Result } from "@/shared/types/result.types";
import {
  MoneyPostingWorkflowRepository,
} from "./moneyPostingWorkflow.repository";
import {
  MoneyPostingBalanceAdjustment,
  MoneyPostingWorkflowPlan,
} from "../types/moneyPostingWorkflow.types";

type CreateMoneyPostingWorkflowRepositoryParams = {
  transactionDatasource: MoneyPostingDatasource;
  moneyAccountBalanceDatasource: MoneyAccountBalanceDatasource;
};

export const createMoneyPostingWorkflowRepository = ({
  transactionDatasource,
  moneyAccountBalanceDatasource,
}: CreateMoneyPostingWorkflowRepositoryParams): MoneyPostingWorkflowRepository => ({
  async getTransactionByRemoteId(remoteId) {
    return transactionDatasource.getTransactionByRemoteId(remoteId);
  },

  async getActiveTransactionByIdempotencyKey(idempotencyKey) {
    return transactionDatasource.getActiveTransactionByIdempotencyKey(idempotencyKey);
  },

  async applyPostMoneyMovementPlan(
    plan: MoneyPostingWorkflowPlan,
  ): Promise<Result<TransactionModel>> {
    return transactionDatasource.runInTransaction(async () => {
      if (plan.transactionMutation.kind === "return_existing") {
        if (!plan.existingTransaction) {
          throw new Error("Missing existing transaction for return-existing plan.");
        }

        return plan.existingTransaction;
      }

      if (plan.transactionMutation.kind === "create") {
        if (!plan.normalizedPayload) {
          throw new Error("Missing payload for create posting plan.");
        }

        const created = unwrapResult(
          await transactionDatasource.createTransaction(
            plan.normalizedPayload,
            plan.transactionMutation.postingStatus,
          ),
        );
        await applyBalanceAdjustments({
          moneyAccountBalanceDatasource,
          balanceAdjustments: plan.balanceAdjustments,
        });
        return created;
      }

      if (plan.transactionMutation.kind !== "update") {
        throw new Error("Invalid mutation kind for post money movement plan.");
      }

      if (!plan.existingTransaction || !plan.normalizedPayload) {
        throw new Error("Missing transaction context for update posting plan.");
      }

      await applyBalanceAdjustments({
        moneyAccountBalanceDatasource,
        balanceAdjustments: plan.balanceAdjustments,
      });

      return unwrapResult(
        await transactionDatasource.updateTransaction(
          plan.existingTransaction,
          plan.normalizedPayload,
          plan.transactionMutation.postingStatus,
        ),
      );
    });
  },

  async applyDeleteMoneyMovementPlan(
    plan: MoneyPostingWorkflowPlan,
  ): Promise<Result<boolean>> {
    return transactionDatasource.runInTransaction(async () => {
      if (plan.transactionMutation.kind !== "void") {
        throw new Error("Invalid mutation kind for delete money movement plan.");
      }

      if (!plan.existingTransaction) {
        throw new Error("Missing existing transaction for void posting plan.");
      }

      await applyBalanceAdjustments({
        moneyAccountBalanceDatasource,
        balanceAdjustments: plan.balanceAdjustments,
      });
      unwrapResult(
        await transactionDatasource.markTransactionVoided(plan.existingTransaction),
      );
      return true;
    });
  },
});

const applyBalanceAdjustments = async ({
  moneyAccountBalanceDatasource,
  balanceAdjustments,
}: {
  moneyAccountBalanceDatasource: MoneyAccountBalanceDatasource;
  balanceAdjustments: readonly MoneyPostingBalanceAdjustment[];
}): Promise<void> => {
  for (const adjustment of balanceAdjustments) {
    const moneyAccount = unwrapResult(
      await moneyAccountBalanceDatasource.getActiveMoneyAccountByRemoteId(
        adjustment.moneyAccountRemoteId,
      ),
    );

    if (!moneyAccount) {
      throw new Error("Settlement money account not found.");
    }

    unwrapResult(
      await moneyAccountBalanceDatasource.applyMoneyAccountBalanceDelta(
        moneyAccount,
        adjustment.delta,
      ),
    );
  }
};

const unwrapResult = <T>(result: Result<T>): T => {
  if (result.success) {
    return result.value;
  }

  throw result.error;
};
