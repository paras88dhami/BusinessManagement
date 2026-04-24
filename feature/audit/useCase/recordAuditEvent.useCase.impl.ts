import type { AuditRepository } from "@/feature/audit/data/repository/audit.repository";
import { AuditValidationError } from "@/feature/audit/types/audit.error.types";
import type { RecordAuditEventUseCase } from "./recordAuditEvent.useCase";

const createAuditRemoteId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `audit-${randomId}`;
  }

  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const requireText = (value: string, message: string): string | null => {
  const normalized = value.trim();
  return normalized.length > 0 ? null : message;
};

export const createRecordAuditEventUseCase = (
  repository: AuditRepository,
): RecordAuditEventUseCase => ({
  async execute(payload) {
    const validationMessage =
      requireText(payload.accountRemoteId, "Audit account context is required.") ??
      requireText(
        payload.ownerUserRemoteId,
        "Audit owner user context is required.",
      ) ??
      requireText(
        payload.actorUserRemoteId,
        "Audit actor user context is required.",
      ) ??
      requireText(payload.action, "Audit action is required.") ??
      requireText(payload.sourceModule, "Audit source module is required.") ??
      requireText(
        payload.sourceRemoteId,
        "Audit source record id is required.",
      ) ??
      requireText(payload.sourceAction, "Audit source action is required.") ??
      requireText(payload.summary, "Audit summary is required.");

    if (validationMessage) {
      return {
        success: false,
        error: AuditValidationError(validationMessage),
      };
    }

    return repository.saveAuditEvent({
      ...payload,
      remoteId: payload.remoteId?.trim() || createAuditRemoteId(),
      accountRemoteId: payload.accountRemoteId.trim(),
      ownerUserRemoteId: payload.ownerUserRemoteId.trim(),
      actorUserRemoteId: payload.actorUserRemoteId.trim(),
      action: payload.action.trim(),
      sourceModule: payload.sourceModule.trim(),
      sourceRemoteId: payload.sourceRemoteId.trim(),
      sourceAction: payload.sourceAction.trim(),
      summary: payload.summary.trim(),
      metadataJson: payload.metadataJson ?? null,
      createdAt: payload.createdAt ?? Date.now(),
    });
  },
});
