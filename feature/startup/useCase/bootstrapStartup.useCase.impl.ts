import {
  StartupBootstrapError,
  StartupBootstrapErrorType,
  StartupBootstrapTask,
  StartupBootstrapTaskFailureDescriptor,
  StartupFailureKind,
} from "@/feature/startup/types/startup.types";
import { BootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase";
import { logStartupBootstrapFailure } from "@/feature/startup/utils/logStartupBootstrapFailure.util";

const resolveTechnicalMessage = (error: unknown): string | null => {
  if (error instanceof Error) {
    return error.message;
  }

  return null;
};

const buildDefaultFailureDescriptor = (
  task: StartupBootstrapTask,
  error: unknown,
): StartupBootstrapTaskFailureDescriptor => ({
  kind: StartupFailureKind.BootstrapTask,
  reasonCode: `STARTUP_${task.key.toUpperCase()}_FAILED`,
  safeMessage:
    error instanceof Error ? error.message : `Startup task ${task.key} failed.`,
  technicalMessage: resolveTechnicalMessage(error),
});

export const createBootstrapStartupUseCase = (
  tasks: readonly StartupBootstrapTask[],
): BootstrapStartupUseCase => ({
  async execute() {
    for (const task of tasks) {
      try {
        await task.run();
      } catch (error) {
        const failureDescriptor =
          task.describeFailure?.(error) ??
          buildDefaultFailureDescriptor(task, error);

        const startupError: StartupBootstrapError = {
          type: StartupBootstrapErrorType.TaskFailed,
          message: failureDescriptor.safeMessage,
          failedTaskKey: task.key,
          failureKind: failureDescriptor.kind,
          reasonCode: failureDescriptor.reasonCode,
          technicalMessage: failureDescriptor.technicalMessage,
          occurredAt: Date.now(),
        };

        logStartupBootstrapFailure(startupError);

        return {
          success: false,
          error: startupError,
        };
      }
    }

    return { success: true, value: true };
  },
});
