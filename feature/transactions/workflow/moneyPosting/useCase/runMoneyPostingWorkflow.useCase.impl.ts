import {
  AuditModule,
  AuditOutcome,
  AuditSeverity,
} from "@/feature/audit/types/audit.entity.types";
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
  recordAuditEventUseCase?: import("@/feature/audit/useCase/recordAuditEvent.useCase").RecordAuditEventUseCase;
};

export const createRunMoneyPostingWorkflowUseCase = ({
  workflowRepository,
  recordAuditEventUseCase,
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

      const result = await workflowRepository.applyPostMoneyMovementPlan(
        execution.plan,
      );

      if (!result.success) {
        return result;
      }

      const auditResult = await recordAuditEventUseCase?.execute({
        accountRemoteId: normalizedPayload.accountRemoteId,
        ownerUserRemoteId: normalizedPayload.ownerUserRemoteId,
        actorUserRemoteId: normalizedPayload.ownerUserRemoteId,
        module: AuditModule.Transactions,
        action: "money_movement_posted",
        sourceModule: normalizedPayload.sourceModule ?? "transactions",
        sourceRemoteId: normalizedPayload.remoteId,
        sourceAction: normalizedPayload.sourceAction ?? "post_money_movement",
        outcome: AuditOutcome.Success,
        severity: AuditSeverity.Info,
        summary: `Money movement posted: ${normalizedPayload.title}`,
        metadataJson: JSON.stringify({
          transactionRemoteId: normalizedPayload.remoteId,
          amount: normalizedPayload.amount,
          direction: normalizedPayload.direction,
          settlementMoneyAccountRemoteId:
            normalizedPayload.settlementMoneyAccountRemoteId,
          idempotencyKey: normalizedPayload.idempotencyKey,
        }),
      });

      if (auditResult && !auditResult.success) {
        return {
          success: false,
          error: new Error(
            `Money movement posted, but audit event failed: ${auditResult.error.message}`,
          ),
        };
      }

      return result;
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

      const result = await workflowRepository.applyDeleteMoneyMovementPlan(
        execution.plan,
      );

      if (!result.success) {
        return result;
      }

      if (existing) {
        const auditResult = await recordAuditEventUseCase?.execute({
          accountRemoteId: existing.accountRemoteId,
          ownerUserRemoteId: existing.ownerUserRemoteId,
          actorUserRemoteId: existing.ownerUserRemoteId,
          module: AuditModule.Transactions,
          action: "money_movement_voided",
          sourceModule: existing.sourceModule ?? "transactions",
          sourceRemoteId: existing.remoteId,
          sourceAction: "void_money_movement",
          outcome: AuditOutcome.Success,
          severity: AuditSeverity.Warning,
          summary: `Money movement voided: ${existing.title}`,
          metadataJson: JSON.stringify({
            transactionRemoteId: existing.remoteId,
            amount: existing.amount,
            direction: existing.direction,
            settlementMoneyAccountRemoteId:
              existing.settlementMoneyAccountRemoteId,
          }),
        });

        if (auditResult && !auditResult.success) {
          return {
            success: false,
            error: new Error(
              `Money movement voided, but audit event failed: ${auditResult.error.message}`,
            ),
          };
        }
      }

      return result;
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
