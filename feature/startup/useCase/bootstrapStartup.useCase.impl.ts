import {
  StartupBootstrapErrorType,
  StartupBootstrapTask,
} from "@/feature/startup/types/startup.types";
import { BootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase";

export const createBootstrapStartupUseCase = (
  tasks: readonly StartupBootstrapTask[],
): BootstrapStartupUseCase => ({
  async execute() {
    for (const task of tasks) {
      try {
        await task.run();
      } catch (error) {
        const resolvedMessage =
          error instanceof Error
            ? error.message
            : `Startup task ${task.key} failed.`;

        return {
          success: false,
          error: {
            type: StartupBootstrapErrorType.TaskFailed,
            message: resolvedMessage,
            failedTaskKey: task.key,
          },
        };
      }
    }

    return { success: true, value: true };
  },
});
