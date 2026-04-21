import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import {
    OrderStatus,
    OrderStatusValue,
    OrderValidationError,
} from "@/feature/orders/types/order.types";
import { isOrderFinancialStatus } from "@/feature/orders/utils/orderCommercialEffects.util";
import { canTransitionOrderToDelivered } from "@/feature/orders/utils/orderInventoryLinkage.util";
import { ChangeOrderStatusUseCase } from "./changeOrderStatus.useCase";
import { EnsureOrderBillingAndDueLinksUseCase } from "./ensureOrderBillingAndDueLinks.useCase";
import { EnsureOrderDeliveredInventoryMovementsUseCase } from "./ensureOrderDeliveredInventoryMovements.useCase";
import { ReturnOrderUseCase } from "./returnOrder.useCase";

export const createChangeOrderStatusUseCase = (params: {
  repository: OrderRepository;
  ensureOrderBillingAndDueLinksUseCase: EnsureOrderBillingAndDueLinksUseCase;
  ensureOrderDeliveredInventoryMovementsUseCase: EnsureOrderDeliveredInventoryMovementsUseCase;
  returnOrderUseCase: ReturnOrderUseCase;
}): ChangeOrderStatusUseCase => ({
  async execute(paramsInput: { remoteId: string; status: OrderStatusValue }) {
    const normalizedRemoteId = paramsInput.remoteId.trim();
    if (!normalizedRemoteId) {
      return {
        success: false,
        error: OrderValidationError("Order remote id is required."),
      };
    }

    const currentOrderResult = await params.repository.getOrderByRemoteId(
      normalizedRemoteId,
    );
    if (!currentOrderResult.success) {
      return { success: false, error: currentOrderResult.error };
    }

    const currentOrder = currentOrderResult.value;

    if (paramsInput.status === currentOrder.status) {
      return currentOrderResult;
    }

    if (paramsInput.status === OrderStatus.Returned) {
      return params.returnOrderUseCase.execute(normalizedRemoteId);
    }

    if (
      paramsInput.status === OrderStatus.Delivered &&
      !canTransitionOrderToDelivered(currentOrder.status)
    ) {
      return {
        success: false,
        error: OrderValidationError(
          "Only confirmed, processing, ready, or shipped orders can be marked delivered.",
        ),
      };
    }

    const updateResult = await params.repository.updateOrderStatusByRemoteId(
      normalizedRemoteId,
      paramsInput.status,
    );
    if (!updateResult.success) {
      return updateResult;
    }

    if (!isOrderFinancialStatus(paramsInput.status)) {
      return updateResult;
    }

    await params.ensureOrderBillingAndDueLinksUseCase.execute(normalizedRemoteId);

    const ensureResult =
      await params.ensureOrderBillingAndDueLinksUseCase.execute(normalizedRemoteId);

    if (!ensureResult.success) {
      const revertResult = await params.repository.updateOrderStatusByRemoteId(
        normalizedRemoteId,
        currentOrder.status,
      );

      if (!revertResult.success) {
        return { success: false, error: revertResult.error };
      }

      return {
        success: false,
        error: ensureResult.error,
      };
    }

    if (paramsInput.status === OrderStatus.Delivered) {
      const ensureInventoryResult =
        await params.ensureOrderDeliveredInventoryMovementsUseCase.execute(
          normalizedRemoteId,
          Date.now(),
        );

      if (!ensureInventoryResult.success) {
        const revertResult = await params.repository.updateOrderStatusByRemoteId(
          normalizedRemoteId,
          currentOrder.status,
        );

        if (!revertResult.success) {
          return { success: false, error: revertResult.error };
        }

        return {
          success: false,
          error: ensureInventoryResult.error,
        };
      }
    }

    return params.repository.getOrderByRemoteId(normalizedRemoteId);
  },
});
