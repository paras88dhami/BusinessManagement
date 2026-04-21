import { DeleteInventoryMovementsByRemoteIdsUseCase } from "@/feature/inventory/useCase/deleteInventoryMovementsByRemoteIds.useCase";
import { GetInventoryMovementsBySourceUseCase } from "@/feature/inventory/useCase/getInventoryMovementsBySource.useCase";
import { SaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase";
import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import {
    OrderStatus,
    OrderValidationError,
} from "@/feature/orders/types/order.types";
import {
    buildOrderInventorySourceLookupParams,
    buildOrderReturnInventoryPayloads,
    canTransitionOrderToReturned,
    mapOrderInventoryMovementsByLineAndAction,
    ORDER_INVENTORY_SOURCE_ACTION,
} from "@/feature/orders/utils/orderInventoryLinkage.util";
import { GetProductsUseCase } from "@/feature/products/useCase/getProducts.useCase";
import { ReturnOrderUseCase } from "./returnOrder.useCase";

const buildRollbackAwareValidationError = (params: {
  primaryMessage: string;
  rollbackMessage: string | null;
}) =>
  OrderValidationError(
    params.rollbackMessage
      ? `${params.primaryMessage} Rollback failed: ${params.rollbackMessage}` 
      : params.primaryMessage,
  );

export const createReturnOrderUseCase = (params: {
  repository: OrderRepository;
  getProductsUseCase: GetProductsUseCase;
  getInventoryMovementsBySourceUseCase: GetInventoryMovementsBySourceUseCase;
  saveInventoryMovementsUseCase: SaveInventoryMovementsUseCase;
  deleteInventoryMovementsByRemoteIdsUseCase: DeleteInventoryMovementsByRemoteIdsUseCase;
}): ReturnOrderUseCase => ({
  async execute(remoteId: string) {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return {
        success: false,
        error: OrderValidationError("Order remote id is required."),
      };
    }

    const orderResult = await params.repository.getOrderByRemoteId(
      normalizedRemoteId,
    );
    if (!orderResult.success) {
      return { success: false, error: orderResult.error };
    }

    const order = orderResult.value;

    if (order.status === OrderStatus.Returned) {
      return orderResult;
    }

    if (!canTransitionOrderToReturned(order.status)) {
      return {
        success: false,
        error: OrderValidationError(
          "Only delivered orders can be returned.",
        ),
      };
    }

    const productsResult = await params.getProductsUseCase.execute(
      order.accountRemoteId,
    );
    if (!productsResult.success) {
      return {
        success: false,
        error: OrderValidationError(productsResult.error.message),
      };
    }

    const productsByRemoteId = new Map(
      productsResult.value.map((product) => [product.remoteId, product]),
    );

    const returnPayloads = buildOrderReturnInventoryPayloads({
      order,
      productsByRemoteId,
      movementAt: Date.now(),
    });

    if (returnPayloads.length === 0) {
      return params.repository.updateOrderStatusByRemoteId(
        normalizedRemoteId,
        OrderStatus.Returned,
      );
    }

    const sourceMovementsResult =
      await params.getInventoryMovementsBySourceUseCase.execute(
        buildOrderInventorySourceLookupParams({
          accountRemoteId: order.accountRemoteId,
          orderRemoteId: order.remoteId,
        }),
      );

    if (!sourceMovementsResult.success) {
      return {
        success: false,
        error: OrderValidationError(sourceMovementsResult.error.message),
      };
    }

    const movementByLineAndAction = mapOrderInventoryMovementsByLineAndAction(
      sourceMovementsResult.value,
    );

    for (const payload of returnPayloads) {
      const sourceLineRemoteId = payload.sourceLineRemoteId ?? "";
      const hasDeliveryMovement = movementByLineAndAction.has(
        `${sourceLineRemoteId}:${ORDER_INVENTORY_SOURCE_ACTION.DeliveryFulfillment}`,
      );

      if (!hasDeliveryMovement) {
        return {
          success: false,
          error: OrderValidationError(
            "This order has no posted delivery inventory movement for one or more item lines. Mark the order as delivered through the supported status flow before returning it.",
          ),
        };
      }
    }

    const missingReturnPayloads = returnPayloads.filter(
      (payload) =>
        !movementByLineAndAction.has(
          `${payload.sourceLineRemoteId}:${ORDER_INVENTORY_SOURCE_ACTION.ReturnRestock}`,
        ),
    );

    if (missingReturnPayloads.length === 0) {
      return params.repository.updateOrderStatusByRemoteId(
        normalizedRemoteId,
        OrderStatus.Returned,
      );
    }

    const saveResult = await params.saveInventoryMovementsUseCase.execute(
      missingReturnPayloads,
    );

    if (!saveResult.success) {
      return {
        success: false,
        error: OrderValidationError(saveResult.error.message),
      };
    }

    const statusUpdateResult = await params.repository.updateOrderStatusByRemoteId(
      normalizedRemoteId,
      OrderStatus.Returned,
    );

    if (statusUpdateResult.success) {
      return statusUpdateResult;
    }

    const rollbackResult =
      await params.deleteInventoryMovementsByRemoteIdsUseCase.execute(
        missingReturnPayloads.map((payload) => payload.remoteId),
      );

    return {
      success: false,
      error: buildRollbackAwareValidationError({
        primaryMessage: statusUpdateResult.error.message,
        rollbackMessage: rollbackResult.success
          ? null
          : rollbackResult.error.message,
      }),
    };
  },
});
