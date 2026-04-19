import { SaveTransactionPayload } from "@/feature/transactions/types/transaction.entity.types";
import { Result } from "@/shared/types/result.types";
import { MoneyPostingWorkflowRepository } from "../repository/moneyPostingWorkflow.repository";
import {
  buildDeleteMoneyPostingPlan,
  buildPostMoneyPostingPlan,
} from "../utils/buildMoneyPostingPlan.util";
import { normalizeMoneyPostingPayload } from "../utils/normalizeMoneyPostingPayload.util";
import { validateMoneyPostingPayload } from "../utils/validateMoneyPostingPayload.util";
import { RunMoneyPostingWorkflowUseCase } from "./runMoneyPostingWorkflow.useCase";

type CreateRunMoneyPostingWorkflowUseCaseParams = {
  workflowRepository: MoneyPostingWorkflowRepository;
};

export const createRunMoneyPostingWorkflowUseCase = ({
  workflowRepository,
}: CreateRunMoneyPostingWorkflowUseCaseParams): RunMoneyPostingWorkflowUseCase => ({
  async postMoneyMovement(payload: SaveTransactionPayload) {
    try {
      const normalizedPayload = normalizeMoneyPostingPayload(payload);
      const validationError = validateMoneyPostingPayload(normalizedPayload);
      if (validationError) {
        throw new Error(validationError);
      }

      const existingByRemoteId = unwrapResult(
        await workflowRepository.getTransactionByRemoteId(normalizedPayload.remoteId),
      );
      const existingByIdempotencyKey =
        !existingByRemoteId && normalizedPayload.idempotencyKey
          ? unwrapResult(
              await workflowRepository.getActiveTransactionByIdempotencyKey(
                normalizedPayload.idempotencyKey,
              ),
            )
          : null;

      const execution = buildPostMoneyPostingPlan({
        existingByRemoteId,
        existingByIdempotencyKey,
        payload: normalizedPayload,
      });

      if (execution.plan.transactionMutation.kind === "return_existing") {
        if (!execution.plan.existingTransaction) {
          throw new Error("Missing existing transaction for idempotent return.");
        }

        return {
          success: true,
          value: execution.plan.existingTransaction,
        };
      }

      return workflowRepository.applyPostMoneyMovementPlan(execution.plan);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async deleteMoneyMovementByRemoteId(remoteId: string) {
    try {
      const existing = unwrapResult(
        await workflowRepository.getTransactionByRemoteId(remoteId),
      );
      const execution = buildDeleteMoneyPostingPlan({
        existing,
      });

      if (execution.kind === "return_result") {
        return {
          success: true,
          value: execution.value,
        };
      }

      return workflowRepository.applyDeleteMoneyMovementPlan(execution.plan);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});

const unwrapResult = <T>(result: Result<T>): T => {
  if (result.success) {
    return result.value;
  }

  throw result.error;
};
