import type {
  AuditEvent,
  AuditResult,
  SaveAuditEventPayload,
} from "@/feature/audit/types/audit.entity.types";

export interface RecordAuditEventUseCase {
  execute(
    payload: Omit<SaveAuditEventPayload, "remoteId" | "createdAt"> & {
      remoteId?: string;
      createdAt?: number;
    },
  ): Promise<AuditResult<AuditEvent>>;
}
