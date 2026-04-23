import { InventoryValidationError } from "@/feature/inventory/types/inventory.types";
import { createGetInventoryMovementsBySourceUseCase } from "@/feature/inventory/useCase/getInventoryMovementsBySource.useCase.impl";
import { describe, expect, it, vi } from "vitest";

describe("createGetInventoryMovementsBySourceUseCase", () => {
  it("validates required fields before reading inventory source records", async () => {
    const repository = {
      getInventoryMovementsBySource: vi.fn(),
    };

    const useCase = createGetInventoryMovementsBySourceUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      accountRemoteId: " ",
      sourceModule: "pos",
      sourceRemoteId: "sale-1",
    });

    expect(repository.getInventoryMovementsBySource).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: InventoryValidationError("Account remote id is required."),
    });
  });

  it("passes normalized source lookup to the repository", async () => {
    const repository = {
      getInventoryMovementsBySource: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createGetInventoryMovementsBySourceUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      accountRemoteId: " account-1 ",
      sourceModule: " pos ",
      sourceRemoteId: " sale-1 ",
    });

    expect(repository.getInventoryMovementsBySource).toHaveBeenCalledWith({
      accountRemoteId: "account-1",
      sourceModule: "pos",
      sourceRemoteId: "sale-1",
    });
    expect(result).toEqual({
      success: true,
      value: [],
    });
  });
});
