import { Result } from "@/shared/types/result.types";

export const StartupBootstrapStatus = {
  Loading: "loading",
  Ready: "ready",
  Failed: "failed",
} as const;

export type StartupBootstrapStatusValue =
  (typeof StartupBootstrapStatus)[keyof typeof StartupBootstrapStatus];

export const StartupFailureKind = {
  Database: "database",
  BootstrapTask: "bootstrap_task",
  Unknown: "unknown",
} as const;

export type StartupFailureKindValue =
  (typeof StartupFailureKind)[keyof typeof StartupFailureKind];

export type StartupBootstrapTaskFailureDescriptor = {
  kind: StartupFailureKindValue;
  reasonCode: string;
  safeMessage: string;
  technicalMessage: string | null;
};

export type StartupBootstrapTask = {
  key: string;
  run: () => Promise<void>;
  describeFailure?: (
    error: unknown,
  ) => StartupBootstrapTaskFailureDescriptor;
};

export const StartupBootstrapErrorType = {
  TaskFailed: "TASK_FAILED",
  Unknown: "UNKNOWN",
} as const;

export type StartupBootstrapError = {
  type: (typeof StartupBootstrapErrorType)[keyof typeof StartupBootstrapErrorType];
  message: string;
  failedTaskKey: string | null;
  failureKind: StartupFailureKindValue;
  reasonCode: string;
  technicalMessage: string | null;
  occurredAt: number;
};

export type StartupBootstrapResult = Result<true, StartupBootstrapError>;

export type StartupBootstrapState = {
  status: StartupBootstrapStatusValue;
  errorMessage: string | null;
  failedTaskKey: string | null;
  failureKind: StartupFailureKindValue | null;
  reasonCode: string | null;
  technicalErrorMessage: string | null;
};
