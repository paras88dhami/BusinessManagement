import {
    InventoryMovement,
    InventoryMovementSourceModule,
    InventoryMovementType,
    InventorySourceLookupParams,
    SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import {
    Order,
    OrderLine,
    OrderStatus,
    OrderStatusValue,
} from "@/feature/orders/types/order.types";
import { Product } from "@/feature/products/types/product.types";

export const ORDER_INVENTORY_SOURCE_ACTION = {
  DeliveryFulfillment: "delivery_fulfillment",
  ReturnRestock: "return_restock",
} as const;

const safeTrim = (value: string | null | undefined): string =>
  typeof value === "string" ? value.trim() : "";

const buildToken = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

export const canTransitionOrderToDelivered = (
  currentStatus: OrderStatusValue,
): boolean =>
  currentStatus === OrderStatus.Confirmed ||
  currentStatus === OrderStatus.Processing ||
  currentStatus === OrderStatus.Ready ||
  currentStatus === OrderStatus.Shipped ||
  currentStatus === OrderStatus.Delivered;

export const canTransitionOrderToReturned = (
  currentStatus: OrderStatusValue,
): boolean =>
  currentStatus === OrderStatus.Delivered ||
  currentStatus === OrderStatus.Returned;

export const buildOrderDeliveryInventoryMovementRemoteId = (params: {
  orderRemoteId: string;
  lineRemoteId: string;
}): string =>
  `inv-order-delivery-${buildToken(params.orderRemoteId)}-${buildToken(
    params.lineRemoteId,
  )}`;

export const buildOrderReturnInventoryMovementRemoteId = (params: {
  orderRemoteId: string;
  lineRemoteId: string;
}): string =>
  `inv-order-return-${buildToken(params.orderRemoteId)}-${buildToken(
    params.lineRemoteId,
  )}`;

export const buildOrderInventorySourceLookupParams = (params: {
  accountRemoteId: string;
  orderRemoteId: string;
}): InventorySourceLookupParams => ({
  accountRemoteId: params.accountRemoteId,
  sourceModule: InventoryMovementSourceModule.Orders,
  sourceRemoteId: params.orderRemoteId,
});

export const getInventoryTrackedOrderLines = (params: {
  order: Order;
  productsByRemoteId: Map<string, Product>;
}): Array<{ line: OrderLine; product: Product }> => {
  const orderItems = Array.isArray(params.order.items) ? params.order.items : [];

  return orderItems.flatMap((line) => {
    const product = params.productsByRemoteId.get(line.productRemoteId);
    if (!product) {
      return [];
    }

    if (product.kind !== "item") {
      return [];
    }

    return [{ line, product }];
  });
};

export const buildOrderDeliveryInventoryPayloads = (params: {
  order: Order;
  productsByRemoteId: Map<string, Product>;
  movementAt: number;
}): SaveInventoryMovementPayload[] =>
  getInventoryTrackedOrderLines(params).map(({ line, product }) => ({
    remoteId: buildOrderDeliveryInventoryMovementRemoteId({
      orderRemoteId: params.order.remoteId,
      lineRemoteId: line.remoteId,
    }),
    accountRemoteId: params.order.accountRemoteId,
    productRemoteId: product.remoteId,
    type: InventoryMovementType.SaleOut,
    quantity: line.quantity,
    unitRate: null,
    reason: null,
    remark: `Order ${safeTrim(params.order.orderNumber) || params.order.remoteId} delivered`,
    sourceModule: InventoryMovementSourceModule.Orders,
    sourceRemoteId: params.order.remoteId,
    sourceLineRemoteId: line.remoteId,
    sourceAction: ORDER_INVENTORY_SOURCE_ACTION.DeliveryFulfillment,
    movementAt: params.movementAt,
  }));

export const buildOrderReturnInventoryPayloads = (params: {
  order: Order;
  productsByRemoteId: Map<string, Product>;
  movementAt: number;
}): SaveInventoryMovementPayload[] =>
  getInventoryTrackedOrderLines(params).map(({ line, product }) => ({
    remoteId: buildOrderReturnInventoryMovementRemoteId({
      orderRemoteId: params.order.remoteId,
      lineRemoteId: line.remoteId,
    }),
    accountRemoteId: params.order.accountRemoteId,
    productRemoteId: product.remoteId,
    type: InventoryMovementType.StockIn,
    quantity: line.quantity,
    unitRate: null,
    reason: null,
    remark: `Order ${safeTrim(params.order.orderNumber) || params.order.remoteId} returned`,
    sourceModule: InventoryMovementSourceModule.Orders,
    sourceRemoteId: params.order.remoteId,
    sourceLineRemoteId: line.remoteId,
    sourceAction: ORDER_INVENTORY_SOURCE_ACTION.ReturnRestock,
    movementAt: params.movementAt,
  }));

export const mapOrderInventoryMovementsByLineAndAction = (
  movements: readonly InventoryMovement[],
): Map<string, InventoryMovement> => {
  const map = new Map<string, InventoryMovement>();

  for (const movement of movements) {
    const sourceLineRemoteId = safeTrim(movement.sourceLineRemoteId);
    const sourceAction = safeTrim(movement.sourceAction);
    if (!sourceLineRemoteId || !sourceAction) {
      continue;
    }

    map.set(`${sourceLineRemoteId}:${sourceAction}`, movement);
  }

  return map;
};
