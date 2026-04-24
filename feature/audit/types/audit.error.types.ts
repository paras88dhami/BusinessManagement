export const AuditErrorType = {
  Validation: "VALIDATION",
  Database: "DATABASE",
  Unknown: "UNKNOWN",
} as const;

export type AuditError = {
  type: (typeof AuditErrorType)[keyof typeof AuditErrorType];
  message: string;
};

export const AuditValidationError = (message: string): AuditError => ({
  type: AuditErrorType.Validation,
  message,
});

export const AuditDatabaseError = (
  message = "Unable to save audit event.",
): AuditError => ({
  type: AuditErrorType.Database,
  message,
});

export const AuditUnknownError = (
  message = "Unexpected audit error.",
): AuditError => ({
  type: AuditErrorType.Unknown,
  message,
});
