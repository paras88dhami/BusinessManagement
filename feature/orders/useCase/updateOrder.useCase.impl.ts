import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import {
  OrderResult,
  OrderValidationError,
  SaveOrderPayload,
} from "@/feature/orders/types/order.types";
import { GetProductsUseCase } from "@/feature/products/useCase/getProducts.useCase";
import {
  buildOrderSnapshotPayload,
  validateOrderDraftPayload,
} from "./buildOrderSnapshotPayload.util";
import { UpdateOrderUseCase } from "./updateOrder.useCase";

export const createUpdateOrderUseCase = (params: {
  repository: OrderRepository;
  getProductsUseCase: GetProductsUseCase;
}): UpdateOrderUseCase => ({
  async execute(payload: SaveOrderPayload): Promise<OrderResult> {
    const validationError = validateOrderDraftPayload(payload);
    if (validationError) {
      return { success: false, error: OrderValidationError(validationError) };
    }

    const existingOrderResult = await params.repository.getOrderByRemoteId(
      payload.remoteId.trim(),
    );
    if (!existingOrderResult.success) {
      return { success: false, error: existingOrderResult.error };
    }

    const productsResult = await params.getProductsUseCase.execute(
      payload.accountRemoteId.trim(),
    );
    if (!productsResult.success) {
      return {
        success: false,
        error: OrderValidationError(productsResult.error.message),
      };
    }

    const snapshotPayloadResult = buildOrderSnapshotPayload({
      payload,
      products: productsResult.value,
      existingOrder: existingOrderResult.value,
    });

    if (!snapshotPayloadResult.success) {
      return {
        success: false,
        error: OrderValidationError(snapshotPayloadResult.error),
      };
    }

    return params.repository.saveOrder(snapshotPayloadResult.value);
  },
});