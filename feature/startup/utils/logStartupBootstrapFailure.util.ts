import { StartupBootstrapError } from "@/feature/startup/types/startup.types";

export const logStartupBootstrapFailure = (
  error: StartupBootstrapError,
): void => {
  console.error("Startup bootstrap failed.", {
    type: error.type,
    failedTaskKey: error.failedTaskKey,
    failureKind: error.failureKind,
    reasonCode: error.reasonCode,
    technicalMessage: error.technicalMessage,
    occurredAt: error.occurredAt,
  });
};
