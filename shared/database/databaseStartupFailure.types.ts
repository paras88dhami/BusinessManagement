export const DatabaseStartupFailureSource = {
  AdapterSetup: "adapter_setup",
  IntegrityCheck: "integrity_check",
  Unknown: "unknown",
} as const;

export type DatabaseStartupFailureSourceValue =
  (typeof DatabaseStartupFailureSource)[keyof typeof DatabaseStartupFailureSource];

export type DatabaseStartupFailureDescription = {
  source: DatabaseStartupFailureSourceValue;
  reasonCode: string;
  safeMessage: string;
  technicalMessage: string | null;
};
