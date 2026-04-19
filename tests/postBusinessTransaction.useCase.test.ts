import type { Database } from "@nozbe/watermelondb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createLocalMoneyPostingDatasource: vi.fn(),
  createLocalMoneyAccountBalanceDatasource: vi.fn(),
  createMoneyPostingWorkflowRepository: vi.fn(),
  createMoneyPostingRepository: vi.fn(),
  createPostMoneyMovementUseCase: vi.fn(),
}));

vi.mock("@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl", () => ({
  createLocalMoneyPostingDatasource: mocks.createLocalMoneyPostingDatasource,
}));

vi.mock("@/feature/transactions/data/dataSource/local.moneyAccountBalance.datasource.impl", () => ({
  createLocalMoneyAccountBalanceDatasource:
    mocks.createLocalMoneyAccountBalanceDatasource,
}));

vi.mock("@/feature/transactions/workflow/moneyPosting/repository/moneyPostingWorkflow.repository.impl", () => ({
  createMoneyPostingWorkflowRepository:
    mocks.createMoneyPostingWorkflowRepository,
}));

vi.mock("@/feature/transactions/data/repository/moneyPosting.repository.impl", () => ({
  createMoneyPostingRepository: mocks.createMoneyPostingRepository,
}));

vi.mock("@/feature/transactions/useCase/postMoneyMovement.useCase.impl", () => ({
  createPostMoneyMovementUseCase: mocks.createPostMoneyMovementUseCase,
}));

describe("postBusinessTransaction.useCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PostBusinessTransactionUseCase still routes through canonical money posting behavior", async () => {
    const { createPostBusinessTransactionUseCase } = await import(
      "@/feature/transactions/useCase/postBusinessTransaction.useCase.impl"
    );
    const database = {} as Database;
    const transactionDatasource = { id: "tx-datasource" };
    const moneyAccountBalanceDatasource = { id: "money-account-datasource" };
    const workflowRepository = { id: "workflow-repository" };
    const repositoryAdapter = { id: "repository-adapter" };
    const canonicalPostMoneyMovementUseCase = {
      execute: vi.fn(),
    };

    mocks.createLocalMoneyPostingDatasource.mockReturnValue(
      transactionDatasource,
    );
    mocks.createLocalMoneyAccountBalanceDatasource.mockReturnValue(
      moneyAccountBalanceDatasource,
    );
    mocks.createMoneyPostingWorkflowRepository.mockReturnValue(
      workflowRepository,
    );
    mocks.createMoneyPostingRepository.mockReturnValue(repositoryAdapter);
    mocks.createPostMoneyMovementUseCase.mockReturnValue(
      canonicalPostMoneyMovementUseCase,
    );

    const postBusinessTransactionUseCase =
      createPostBusinessTransactionUseCase(database);

    expect(postBusinessTransactionUseCase).toBe(
      canonicalPostMoneyMovementUseCase,
    );
    expect(mocks.createLocalMoneyPostingDatasource).toHaveBeenCalledTimes(1);
    expect(mocks.createLocalMoneyPostingDatasource).toHaveBeenCalledWith(
      database,
    );
    expect(
      mocks.createLocalMoneyAccountBalanceDatasource,
    ).toHaveBeenCalledTimes(1);
    expect(
      mocks.createLocalMoneyAccountBalanceDatasource,
    ).toHaveBeenCalledWith(database);
    expect(mocks.createMoneyPostingWorkflowRepository).toHaveBeenCalledTimes(1);
    expect(mocks.createMoneyPostingWorkflowRepository).toHaveBeenCalledWith({
      transactionDatasource,
      moneyAccountBalanceDatasource,
    });
    expect(mocks.createMoneyPostingRepository).toHaveBeenCalledTimes(1);
    expect(mocks.createMoneyPostingRepository).toHaveBeenCalledWith(
      workflowRepository,
    );
    expect(mocks.createPostMoneyMovementUseCase).toHaveBeenCalledTimes(1);
    expect(mocks.createPostMoneyMovementUseCase).toHaveBeenCalledWith(
      repositoryAdapter,
    );
  });
});
