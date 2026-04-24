import type { SaveAuditEventPayload } from "@/feature/audit/types/audit.entity.types";
import type { Result } from "@/shared/types/result.types";
import type { AuditEventModel } from "./db/auditEvent.model";

export interface AuditDatasource {
  saveAuditEvent(payload: SaveAuditEventPayload): Promise<Result<AuditEventModel>>;
}
