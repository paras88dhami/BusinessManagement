import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import {
  OrderOperationResult,
  OrderStatus,
  OrderValidationError,
} from "@/feature/orders/types/order.types";
import { TransactionDirection, TransactionType } from "@/feature/transactions/types/transaction.entity.types";
import { AddTransactionUseCase } from "@/feature/transactions/useCase/addTransaction.useCase";
import * as Crypto from "expo-crypto";
import { RefundOrderUseCase } from "./refundOrder.useCase";

export const createRefundOrderUseCase = (params: {
  orderRepository: OrderRepository;
  addTransactionUseCase: AddTransactionUseCase;
}): RefundOrderUseCase => ({
  async execute({
    orderRemoteId,
    orderNumber,
    ownerUserRemoteId,
    accountRemoteId,
    accountDisplayNameSnapshot,
    currencyCode,
    amount,
    happenedAt,
    note,
  }): Promise<OrderOperationResult> {
    const normalizedOrderRemoteId = orderRemoteId.trim();
    const normalizedOrderNumber = orderNumber.trim();
    const normalizedOwnerUserRemoteId = ownerUserRemoteId.trim();
    const normalizedAccountRemoteId = accountRemoteId.trim();
    const normalizedAccountDisplayNameSnapshot = accountDisplayNameSnapshot.trim();
    const normalizedCurrencyCode = currencyCode?.trim().toUpperCase() ?? null;

    if (!normalizedOrderRemoteId) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    if (!normalizedOrderNumber) {
      return { success: false, error: OrderValidationError("Order number is required.") };
    }
    if (!normalizedOwnerUserRemoteId || !normalizedAccountRemoteId) {
      return { success: false, error: OrderValidationError("Active account context is required.") };
    }
    if (!normalizedAccountDisplayNameSnapshot) {
      return { success: false, error: OrderValidationError("Account label is required.") };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: OrderValidationError("Amount must be greater than zero.") };
    }
    if (!Number.isFinite(happenedAt) || happenedAt <= 0) {
      return { success: false, error: OrderValidationError("Refund date is required.") };
    }

    const orderResult = await params.orderRepository.getOrderByRemoteId(normalizedOrderRemoteId);
    if (!orderResult.success) {
      return { success: false, error: orderResult.error };
    }

    const transactionResult = await params.addTransactionUseCase.execute({
      remoteId: Crypto.randomUUID(),
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      accountRemoteId: normalizedAccountRemoteId,
      accountDisplayNameSnapshot: normalizedAccountDisplayNameSnapshot,
      transactionType: TransactionType.Refund,
      direction: TransactionDirection.Out,
      title: `Order Refund ${normalizedOrderNumber}`,
      amount,
      currencyCode:
        normalizedCurrencyCode && normalizedCurrencyCode.length === 3
          ? normalizedCurrencyCode
          : null,
      categoryLabel: null,
      note: note?.trim() || null,
      happenedAt,
    });

    if (!transactionResult.success) {
      return {
        success: false,
        error: OrderValidationError(transactionResult.error.message),
      };
    }

    const statusUpdateResult = await params.orderRepository.updateOrderStatusByRemoteId(
      normalizedOrderRemoteId,
      OrderStatus.Returned,
    );

    if (!statusUpdateResult.success) {
      return { success: false, error: statusUpdateResult.error };
    }

    return { success: true, value: true };
  },
});
