import { describe, expect, it, vi } from "vitest";
import { createBootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase.impl";
import { StartupBootstrapErrorType } from "@/feature/startup/types/startup.types";

describe("bootstrapStartup.useCase", () => {
  it("executes startup tasks in order", async () => {
    const executionOrder: string[] = [];

    const useCase = createBootstrapStartupUseCase([
      {
        key: "database_ready",
        run: async () => {
          executionOrder.push("database_ready");
        },
      },
      {
        key: "language_bootstrap",
        run: async () => {
          executionOrder.push("language_bootstrap");
        },
      },
    ]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(executionOrder).toEqual(["database_ready", "language_bootstrap"]);
  });

  it("fails with task key and stops remaining tasks", async () => {
    const firstTask = vi.fn(async () => {});
    const failingTask = vi.fn(async () => {
      throw new Error("seed failed");
    });
    const lastTask = vi.fn(async () => {});

    const useCase = createBootstrapStartupUseCase([
      { key: "database_ready", run: firstTask },
      { key: "user_management_seed", run: failingTask },
      { key: "language_bootstrap", run: lastTask },
    ]);

    const result = await useCase.execute();

    expect(firstTask).toHaveBeenCalledTimes(1);
    expect(failingTask).toHaveBeenCalledTimes(1);
    expect(lastTask).not.toHaveBeenCalled();
    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(StartupBootstrapErrorType.TaskFailed);
    expect(result.error.failedTaskKey).toBe("user_management_seed");
    expect(result.error.message).toBe("seed failed");
  });
});
