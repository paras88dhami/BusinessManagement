import { describe, expect, it, vi } from "vitest";

describe("postBusinessTransaction.useCase", () => {
  it("returns the canonical post money movement use case unchanged", async () => {
    const { createPostBusinessTransactionUseCase } = await import(
      "@/feature/transactions/useCase/postBusinessTransaction.useCase.impl"
    );

    const canonicalPostMoneyMovementUseCase = {
      execute: vi.fn(),
    };

    const result = createPostBusinessTransactionUseCase(
      canonicalPostMoneyMovementUseCase as never,
    );

    expect(result).toBe(canonicalPostMoneyMovementUseCase);
  });
});
