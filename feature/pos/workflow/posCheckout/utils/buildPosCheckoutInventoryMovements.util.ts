import {
  InventoryMovementSourceModule,
  InventoryMovementType,
  type SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { ProductKind } from "@/feature/products/types/product.types";
import type { PosCartLine } from "@/feature/pos/types/pos.entity.types";

type BuildPosCheckoutInventoryMovementsParams = {
  businessAccountRemoteId: string;
  saleRemoteId: string;
  saleReferenceNumber: string;
  cartLines: readonly PosCartLine[];
  movementAt: number;
};

type AggregatedSaleLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

const buildMovementRemoteId = ({
  saleRemoteId,
  productId,
}: {
  saleRemoteId: string;
  productId: string;
}): string => `pos-saleout-${saleRemoteId}-${productId}`;

export const buildPosCheckoutInventoryMovements = ({
  businessAccountRemoteId,
  saleRemoteId,
  saleReferenceNumber,
  cartLines,
  movementAt,
}: BuildPosCheckoutInventoryMovementsParams): SaveInventoryMovementPayload[] => {
  const aggregatedByProductId = new Map<string, AggregatedSaleLine>();

  for (const line of cartLines) {
    if (line.kind !== ProductKind.Item) {
      continue;
    }

    if (line.quantity <= 0) {
      continue;
    }

    const existing = aggregatedByProductId.get(line.productId);
    if (!existing) {
      aggregatedByProductId.set(line.productId, {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      });
      continue;
    }

    aggregatedByProductId.set(line.productId, {
      productId: line.productId,
      quantity: existing.quantity + line.quantity,
      unitPrice: existing.unitPrice,
    });
  }

  return Array.from(aggregatedByProductId.values()).map((line) => ({
    remoteId: buildMovementRemoteId({
      saleRemoteId,
      productId: line.productId,
    }),
    accountRemoteId: businessAccountRemoteId,
    productRemoteId: line.productId,
    type: InventoryMovementType.SaleOut,
    quantity: line.quantity,
    unitRate: line.unitPrice,
    reason: null,
    remark: `POS sale ${saleReferenceNumber}`,
    sourceModule: InventoryMovementSourceModule.Pos,
    sourceRemoteId: saleRemoteId,
    sourceLineRemoteId: line.productId,
    sourceAction: "checkout_sale",
    movementAt,
  }));
};
