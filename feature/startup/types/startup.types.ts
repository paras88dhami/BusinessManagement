import { Result } from "@/shared/types/result.types";

export const StartupBootstrapStatus = {
  Loading: "loading",
  Ready: "ready",
  Failed: "failed",
} as const;

export type StartupBootstrapStatusValue =
  (typeof StartupBootstrapStatus)[keyof typeof StartupBootstrapStatus];

export type StartupBootstrapTask = {
  key: string;
  run: () => Promise<void>;
};

export const StartupBootstrapErrorType = {
  TaskFailed: "TASK_FAILED",
  Unknown: "UNKNOWN",
} as const;

export type StartupBootstrapError = {
  type: (typeof StartupBootstrapErrorType)[keyof typeof StartupBootstrapErrorType];
  message: string;
  failedTaskKey: string | null;
};

export type StartupBootstrapResult = Result<true, StartupBootstrapError>;

export type StartupBootstrapState = {
  status: StartupBootstrapStatusValue;
  errorMessage: string | null;
  failedTaskKey: string | null;
};
