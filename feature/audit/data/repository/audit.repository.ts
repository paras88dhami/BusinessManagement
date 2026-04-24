import type {
  AuditEvent,
  AuditResult,
  SaveAuditEventPayload,
} from "@/feature/audit/types/audit.entity.types";

export interface AuditRepository {
  saveAuditEvent(payload: SaveAuditEventPayload): Promise<AuditResult<AuditEvent>>;
}
