import { describe, expect, it, vi } from "vitest";
import { createRecordOrderPaymentUseCase } from "@/feature/orders/useCase/recordOrderPayment.useCase.impl";
import { createRefundOrderUseCase } from "@/feature/orders/useCase/refundOrder.useCase.impl";
import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { AddTransactionUseCase } from "@/feature/transactions/useCase/addTransaction.useCase";
import {
  TransactionDirection,
  TransactionSourceModule,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";

vi.mock("expo-crypto", () => ({
  randomUUID: () => "mocked-uuid",
}));

const createDependencies = () => {
  const orderRepository = {
    getOrderByRemoteId: vi.fn(async (remoteId: string) => ({
      success: true as const,
      value: {
        remoteId,
        orderNumber: "ORD-001",
      },
    })),
    updateOrderStatusByRemoteId: vi.fn(async (remoteId: string, status: string) => ({
      success: true as const,
      value: {
        remoteId,
        status,
      },
    })),
  };

  const addTransactionUseCase = {
    execute: vi.fn(async (payload: any) => ({
      success: true as const,
      value: {
        ...payload,
        settlementMoneyAccountRemoteId:
          payload.settlementMoneyAccountRemoteId ?? null,
        settlementMoneyAccountDisplayNameSnapshot:
          payload.settlementMoneyAccountDisplayNameSnapshot ?? null,
        sourceModule: payload.sourceModule ?? null,
        sourceRemoteId: payload.sourceRemoteId ?? null,
        sourceAction: payload.sourceAction ?? null,
        idempotencyKey: payload.idempotencyKey ?? null,
        postingStatus: payload.postingStatus ?? "posted",
        createdAt: 1,
        updatedAt: 1,
      },
    })),
  };

  return {
    orderRepository,
    addTransactionUseCase,
  };
};

describe("order payment/refund posting", () => {
  it("records order payments with explicit settlement money-account linkage", async () => {
    const { orderRepository, addTransactionUseCase } = createDependencies();
    const useCase = createRecordOrderPaymentUseCase({
      orderRepository: orderRepository as unknown as OrderRepository,
      addTransactionUseCase: addTransactionUseCase as unknown as AddTransactionUseCase,
    });

    const result = await useCase.execute({
      orderRemoteId: " order-1 ",
      orderNumber: " ORD-001 ",
      ownerUserRemoteId: " user-1 ",
      accountRemoteId: " business-1 ",
      accountDisplayNameSnapshot: " Main Business ",
      currencyCode: "npr",
      amount: 500,
      happenedAt: 1_710_000_000_000,
      settlementMoneyAccountRemoteId: " cash-1 ",
      settlementMoneyAccountDisplayNameSnapshot: " Cash Drawer ",
      note: " paid in full ",
    });

    expect(result.success).toBe(true);
    expect(orderRepository.getOrderByRemoteId).toHaveBeenCalledWith("order-1");
    expect(addTransactionUseCase.execute).toHaveBeenCalledWith({
      remoteId: "mocked-uuid",
      ownerUserRemoteId: "user-1",
      accountRemoteId: "business-1",
      accountDisplayNameSnapshot: "Main Business",
      transactionType: TransactionType.Income,
      direction: TransactionDirection.In,
      title: "Order Payment ORD-001",
      amount: 500,
      currencyCode: "NPR",
      categoryLabel: "Orders",
      note: "paid in full",
      happenedAt: 1_710_000_000_000,
      settlementMoneyAccountRemoteId: "cash-1",
      settlementMoneyAccountDisplayNameSnapshot: "Cash Drawer",
      sourceModule: TransactionSourceModule.Orders,
      sourceRemoteId: "order-1",
      sourceAction: "payment",
    });
  });

  it("records refunds through the same money-account-aware posting model and updates order status", async () => {
    const { orderRepository, addTransactionUseCase } = createDependencies();
    const useCase = createRefundOrderUseCase({
      orderRepository: orderRepository as unknown as OrderRepository,
      addTransactionUseCase: addTransactionUseCase as unknown as AddTransactionUseCase,
    });

    const result = await useCase.execute({
      orderRemoteId: "order-2",
      orderNumber: "ORD-002",
      ownerUserRemoteId: "user-1",
      accountRemoteId: "business-1",
      accountDisplayNameSnapshot: "Main Business",
      currencyCode: "NPR",
      amount: 250,
      happenedAt: 1_710_000_100_000,
      settlementMoneyAccountRemoteId: "bank-1",
      settlementMoneyAccountDisplayNameSnapshot: "Main Bank",
      note: "customer refund",
    });

    expect(result.success).toBe(true);
    expect(addTransactionUseCase.execute).toHaveBeenCalledWith({
      remoteId: "mocked-uuid",
      ownerUserRemoteId: "user-1",
      accountRemoteId: "business-1",
      accountDisplayNameSnapshot: "Main Business",
      transactionType: TransactionType.Refund,
      direction: TransactionDirection.Out,
      title: "Order Refund ORD-002",
      amount: 250,
      currencyCode: "NPR",
      categoryLabel: "Orders",
      note: "customer refund",
      happenedAt: 1_710_000_100_000,
      settlementMoneyAccountRemoteId: "bank-1",
      settlementMoneyAccountDisplayNameSnapshot: "Main Bank",
      sourceModule: TransactionSourceModule.Orders,
      sourceRemoteId: "order-2",
      sourceAction: "refund",
    });
    expect(orderRepository.updateOrderStatusByRemoteId).toHaveBeenCalledWith(
      "order-2",
      "returned",
    );
  });

  it("rejects order payments that still lack a concrete settlement money account", async () => {
    const { orderRepository, addTransactionUseCase } = createDependencies();
    const useCase = createRecordOrderPaymentUseCase({
      orderRepository: orderRepository as unknown as OrderRepository,
      addTransactionUseCase: addTransactionUseCase as unknown as AddTransactionUseCase,
    });

    const result = await useCase.execute({
      orderRemoteId: "order-1",
      orderNumber: "ORD-001",
      ownerUserRemoteId: "user-1",
      accountRemoteId: "business-1",
      accountDisplayNameSnapshot: "Main Business",
      currencyCode: "NPR",
      amount: 500,
      happenedAt: 1_710_000_000_000,
      settlementMoneyAccountRemoteId: "   ",
      settlementMoneyAccountDisplayNameSnapshot: "Cash Drawer",
      note: null,
    });

    expect(result.success).toBe(false);
    expect(orderRepository.getOrderByRemoteId).not.toHaveBeenCalled();
    expect(addTransactionUseCase.execute).not.toHaveBeenCalled();

    if (!result.success) {
      expect(result.error.message).toBe("Money account is required.");
    }
  });
});
