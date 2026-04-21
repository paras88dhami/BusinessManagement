import { GetInventoryMovementsBySourceUseCase } from "@/feature/inventory/useCase/getInventoryMovementsBySource.useCase";
import { SaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase";
import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderValidationError } from "@/feature/orders/types/order.types";
import {
  buildOrderDeliveryInventoryPayloads,
  buildOrderInventorySourceLookupParams,
  canTransitionOrderToDelivered,
  mapOrderInventoryMovementsByLineAndAction,
  ORDER_INVENTORY_SOURCE_ACTION,
} from "@/feature/orders/utils/orderInventoryLinkage.util";
import { GetProductsUseCase } from "@/feature/products/useCase/getProducts.useCase";
import { EnsureOrderDeliveredInventoryMovementsUseCase } from "./ensureOrderDeliveredInventoryMovements.useCase";

export const createEnsureOrderDeliveredInventoryMovementsUseCase = (params: {
  repository: OrderRepository;
  getProductsUseCase: GetProductsUseCase;
  getInventoryMovementsBySourceUseCase: GetInventoryMovementsBySourceUseCase;
  saveInventoryMovementsUseCase: SaveInventoryMovementsUseCase;
}): EnsureOrderDeliveredInventoryMovementsUseCase => ({
  async execute(orderRemoteId: string, movementAt: number) {
    const normalizedOrderRemoteId = orderRemoteId.trim();
    if (!normalizedOrderRemoteId) {
      return {
        success: false,
        error: OrderValidationError("Order remote id is required."),
      };
    }

    const orderResult = await params.repository.getOrderByRemoteId(
      normalizedOrderRemoteId,
    );
    if (!orderResult.success) {
      return { success: false, error: orderResult.error };
    }

    const order = orderResult.value;
    if (!canTransitionOrderToDelivered(order.status)) {
      return {
        success: false,
        error: OrderValidationError(
          "Only confirmed, processing, ready, or shipped orders can post delivery inventory.",
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

    const expectedPayloads = buildOrderDeliveryInventoryPayloads({
      order,
      productsByRemoteId,
      movementAt,
    });

    if (expectedPayloads.length === 0) {
      return { success: true, value: { createdMovementRemoteIds: [] } };
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

    const missingPayloads = expectedPayloads.filter(
      (payload) =>
        !movementByLineAndAction.has(
          `${payload.sourceLineRemoteId}:${ORDER_INVENTORY_SOURCE_ACTION.DeliveryFulfillment}`,
        ),
    );

    if (missingPayloads.length === 0) {
      return { success: true, value: { createdMovementRemoteIds: [] } };
    }

    const saveResult = await params.saveInventoryMovementsUseCase.execute(
      missingPayloads,
    );

    if (!saveResult.success) {
      return {
        success: false,
        error: OrderValidationError(saveResult.error.message),
      };
    }

    return {
      success: true,
      value: { createdMovementRemoteIds: missingPayloads.map((p) => p.remoteId) },
    };
  },
});
