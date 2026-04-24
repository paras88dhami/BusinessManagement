import type { AuditDatasource } from "@/feature/audit/data/dataSource/audit.datasource";
import type { AuditEvent } from "@/feature/audit/types/audit.entity.types";
import {
  AuditDatabaseError,
  AuditUnknownError,
} from "@/feature/audit/types/audit.error.types";
import type { AuditRepository } from "./audit.repository";

const mapModelToEntity = (
  model: import("@/feature/audit/data/dataSource/db/auditEvent.model").AuditEventModel,
): AuditEvent => ({
  remoteId: model.remoteId,
  accountRemoteId: model.accountRemoteId,
  ownerUserRemoteId: model.ownerUserRemoteId,
  actorUserRemoteId: model.actorUserRemoteId,
  module: model.module,
  action: model.action,
  sourceModule: model.sourceModule,
  sourceRemoteId: model.sourceRemoteId,
  sourceAction: model.sourceAction,
  outcome: model.outcome,
  severity: model.severity,
  summary: model.summary,
  metadataJson: model.metadataJson,
  createdAt: model.createdAt.getTime(),
  syncStatus: model.recordSyncStatus,
  lastSyncedAt: model.lastSyncedAt,
  deletedAt: model.deletedAt,
});

export const createAuditRepository = (
  datasource: AuditDatasource,
): AuditRepository => ({
  async saveAuditEvent(payload) {
    const result = await datasource.saveAuditEvent(payload);

    if (!result.success) {
      const message = result.error.message.trim();
      return {
        success: false,
        error: message ? AuditDatabaseError(message) : AuditUnknownError(),
      };
    }

    return {
      success: true,
      value: mapModelToEntity(result.value),
    };
  },
});
