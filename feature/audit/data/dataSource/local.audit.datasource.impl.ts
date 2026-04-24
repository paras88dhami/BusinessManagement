import type { SaveAuditEventPayload } from "@/feature/audit/types/audit.entity.types";
import type { Result } from "@/shared/types/result.types";
import type { Database } from "@nozbe/watermelondb";
import type { AuditDatasource } from "./audit.datasource";
import { AuditEventModel } from "./db/auditEvent.model";

const AUDIT_EVENTS_TABLE = "audit_events";

export const createLocalAuditDatasource = (
  database: Database,
): AuditDatasource => ({
  async saveAuditEvent(payload: SaveAuditEventPayload): Promise<Result<AuditEventModel>> {
    try {
      const collection = database.get<AuditEventModel>(AUDIT_EVENTS_TABLE);
      const now = Date.now();

      const saved = await database.write(async () =>
        collection.create((record) => {
          record.remoteId = payload.remoteId;
          record.accountRemoteId = payload.accountRemoteId;
          record.ownerUserRemoteId = payload.ownerUserRemoteId;
          record.actorUserRemoteId = payload.actorUserRemoteId;
          record.module = payload.module;
          record.action = payload.action;
          record.sourceModule = payload.sourceModule;
          record.sourceRemoteId = payload.sourceRemoteId;
          record.sourceAction = payload.sourceAction;
          record.outcome = payload.outcome;
          record.severity = payload.severity;
          record.summary = payload.summary;
          record.metadataJson = payload.metadataJson ?? null;
          record.syncStatus = "pending";
          record.lastSyncedAt = null;
          record.deletedAt = null;
          record._raw.created_at = payload.createdAt;
          record._raw.updated_at = now;
        }),
      );

      return { success: true, value: saved };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unable to save audit event."),
      };
    }
  },
});
