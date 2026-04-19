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
import { CreateOrderUseCase } from "./createOrder.useCase";

export const createCreateOrderUseCase = (params: {
  repository: OrderRepository;
  getProductsUseCase: GetProductsUseCase;
}): CreateOrderUseCase => ({
  async execute(payload: SaveOrderPayload): Promise<OrderResult> {
    const validationError = validateOrderDraftPayload(payload);
    if (validationError) {
      return { success: false, error: OrderValidationError(validationError) };
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
      existingOrder: null,
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