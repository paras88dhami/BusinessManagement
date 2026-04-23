import type { Database } from "@nozbe/watermelondb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createLocalMoneyPostingDatasource: vi.fn(),
  createLocalMoneyAccountBalanceDatasource: vi.fn(),
  createMoneyPostingWorkflowRepository: vi.fn(),
  createMoneyPostingRepository: vi.fn(),
  createPostMoneyMovementUseCase: vi.fn(),
  createDeleteMoneyMovementUseCase: vi.fn(),
}));

vi.mock(
  "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl",
  () => ({
    createLocalMoneyPostingDatasource: mocks.createLocalMoneyPostingDatasource,
  }),
);

vi.mock(
  "@/feature/transactions/data/dataSource/local.moneyAccountBalance.datasource.impl",
  () => ({
    createLocalMoneyAccountBalanceDatasource:
      mocks.createLocalMoneyAccountBalanceDatasource,
  }),
);

vi.mock(
  "@/feature/transactions/workflow/moneyPosting/repository/moneyPostingWorkflow.repository.impl",
  () => ({
    createMoneyPostingWorkflowRepository:
      mocks.createMoneyPostingWorkflowRepository,
  }),
);

vi.mock("@/feature/transactions/data/repository/moneyPosting.repository.impl", () => ({
  createMoneyPostingRepository: mocks.createMoneyPostingRepository,
}));

vi.mock("@/feature/transactions/useCase/postMoneyMovement.useCase.impl", () => ({
  createPostMoneyMovementUseCase: mocks.createPostMoneyMovementUseCase,
}));

vi.mock("@/feature/transactions/useCase/deleteMoneyMovement.useCase.impl", () => ({
  createDeleteMoneyMovementUseCase: mocks.createDeleteMoneyMovementUseCase,
}));

describe("createMoneyPostingRuntime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds canonical posting runtime in the factory layer", async () => {
    const { createMoneyPostingRuntime } = await import(
      "@/feature/transactions/factory/createMoneyPostingRuntime.factory"
    );

    const database = {} as Database;
    const transactionDatasource = { id: "tx-datasource" };
    const moneyAccountBalanceDatasource = { id: "balance-datasource" };
    const workflowRepository = { id: "workflow-repository" };
    const moneyPostingRepository = { id: "money-posting-repository" };

    const postMoneyMovementUseCase = { execute: vi.fn() };
    const deleteMoneyMovementUseCase = { execute: vi.fn() };

    mocks.createLocalMoneyPostingDatasource.mockReturnValue(transactionDatasource);
    mocks.createLocalMoneyAccountBalanceDatasource.mockReturnValue(
      moneyAccountBalanceDatasource,
    );
    mocks.createMoneyPostingWorkflowRepository.mockReturnValue(workflowRepository);
    mocks.createMoneyPostingRepository.mockReturnValue(moneyPostingRepository);
    mocks.createPostMoneyMovementUseCase.mockReturnValue(postMoneyMovementUseCase);
    mocks.createDeleteMoneyMovementUseCase.mockReturnValue(
      deleteMoneyMovementUseCase,
    );

    const runtime = createMoneyPostingRuntime(database);

    expect(mocks.createLocalMoneyPostingDatasource).toHaveBeenCalledWith(database);
    expect(mocks.createLocalMoneyAccountBalanceDatasource).toHaveBeenCalledWith(
      database,
    );
    expect(mocks.createMoneyPostingWorkflowRepository).toHaveBeenCalledWith({
      transactionDatasource,
      moneyAccountBalanceDatasource,
    });
    expect(mocks.createMoneyPostingRepository).toHaveBeenCalledWith(
      workflowRepository,
    );
    expect(mocks.createPostMoneyMovementUseCase).toHaveBeenCalledWith(
      moneyPostingRepository,
    );
    expect(mocks.createDeleteMoneyMovementUseCase).toHaveBeenCalledWith(
      moneyPostingRepository,
    );

    expect(runtime.postMoneyMovementUseCase).toBe(postMoneyMovementUseCase);
    expect(runtime.deleteMoneyMovementUseCase).toBe(deleteMoneyMovementUseCase);
    expect(runtime.postBusinessTransactionUseCase).toBe(postMoneyMovementUseCase);
    expect(runtime.deleteBusinessTransactionUseCase).toBe(
      deleteMoneyMovementUseCase,
    );
  });
});
