import { createGetPosSalesUseCase } from "@/feature/pos/useCase/getPosSales.useCase.impl";
import { describe, expect, it, vi } from "vitest";

describe("getPosSales.useCase", () => {
  it("delegates POS sale history loading to repository", async () => {
    const repository = {
      getPosSales: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createGetPosSalesUseCase(repository);

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
    });

    expect(result).toEqual({
      success: true,
      value: [],
    });
    expect(repository.getPosSales).toHaveBeenCalledWith({
      businessAccountRemoteId: "account-1",
    });
  });

  it("returns repository failure without faking success", async () => {
    const repository = {
      getPosSales: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "VALIDATION" as const,
          message: "Business account context is required.",
        },
      })),
    };

    const useCase = createGetPosSalesUseCase(repository);

    const result = await useCase.execute({
      businessAccountRemoteId: "",
    });

    expect(result).toEqual({
      success: false,
      error: {
        type: "VALIDATION",
        message: "Business account context is required.",
      },
    });
  });
});
