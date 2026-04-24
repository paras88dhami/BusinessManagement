import { AuditEventModel } from "./auditEvent.model";
import { auditEventsTable } from "./auditEvent.schema";

export const auditDbConfig = {
  models: [AuditEventModel],
  tables: [auditEventsTable],
};
