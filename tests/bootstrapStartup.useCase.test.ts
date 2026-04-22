import {
  StartupBootstrapErrorType,
  StartupFailureKind,
  StartupBootstrapTask,
} from "@/feature/startup/types/startup.types";
import { createBootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const { logStartupBootstrapFailureMock } = vi.hoisted(() => ({
  logStartupBootstrapFailureMock: vi.fn(),
}));

vi.mock("@/feature/startup/utils/logStartupBootstrapFailure.util", () => ({
  logStartupBootstrapFailure: logStartupBootstrapFailureMock,
}));

describe("bootstrap startup use case", () => {
  it("uses task-provided failure descriptor and logs structured startup failure", async () => {
    const tasks: readonly StartupBootstrapTask[] = [
      {
        key: "database_ready",
        run: vi.fn(async () => {
          throw new Error(
            "Database integrity check failed: missing unique index.",
          );
        }),
        describeFailure: () => ({
          kind: StartupFailureKind.Database,
          reasonCode: "DB_INTEGRITY_CHECK_FAILED",
          safeMessage:
            "The app found a local data issue and could not continue safely.",
          technicalMessage:
            "Database integrity check failed: missing unique index.",
        }),
      },
    ];

    const useCase = createBootstrapStartupUseCase(tasks);

    const result = await useCase.execute();

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected startup bootstrap to fail.");
    }

    expect(result.error.type).toBe(StartupBootstrapErrorType.TaskFailed);
    expect(result.error.failedTaskKey).toBe("database_ready");
    expect(result.error.failureKind).toBe(StartupFailureKind.Database);
    expect(result.error.reasonCode).toBe("DB_INTEGRITY_CHECK_FAILED");
    expect(result.error.technicalMessage).toBe(
      "Database integrity check failed: missing unique index.",
    );
    expect(typeof result.error.occurredAt).toBe("number");

    expect(logStartupBootstrapFailureMock).toHaveBeenCalledTimes(1);
    expect(logStartupBootstrapFailureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        failedTaskKey: "database_ready",
        failureKind: StartupFailureKind.Database,
        reasonCode: "DB_INTEGRITY_CHECK_FAILED",
      }),
    );
  });

  it("falls back to default startup failure descriptor when task-specific descriptor is missing", async () => {
    const tasks: readonly StartupBootstrapTask[] = [
      {
        key: "language_bootstrap",
        run: vi.fn(async () => {
          throw new Error("Language bootstrap exploded.");
        }),
      },
    ];

    const useCase = createBootstrapStartupUseCase(tasks);

    const result = await useCase.execute();

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected startup bootstrap to fail.");
    }

    expect(result.error.failedTaskKey).toBe("language_bootstrap");
    expect(result.error.failureKind).toBe(StartupFailureKind.BootstrapTask);
    expect(result.error.reasonCode).toBe("STARTUP_LANGUAGE_BOOTSTRAP_FAILED");
    expect(result.error.message).toBe("Language bootstrap exploded.");
  });
});
