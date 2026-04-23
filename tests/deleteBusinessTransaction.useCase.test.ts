import { describe, expect, it, vi } from "vitest";

describe("deleteBusinessTransaction.useCase", () => {
  it("returns the canonical delete money movement use case unchanged", async () => {
    const { createDeleteBusinessTransactionUseCase } = await import(
      "@/feature/transactions/useCase/deleteBusinessTransaction.useCase.impl"
    );

    const canonicalDeleteMoneyMovementUseCase = {
      execute: vi.fn(),
    };

    const result = createDeleteBusinessTransactionUseCase(
      canonicalDeleteMoneyMovementUseCase as never,
    );

    expect(result).toBe(canonicalDeleteMoneyMovementUseCase);
  });
});
