import {
  InventoryMovementType,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { Product, ProductKind } from "@/feature/products/types/product.types";

export type ValidatedInventoryMovementPayload = {
  remoteId: string;
  accountRemoteId: string;
  productRemoteId: string;
  type: SaveInventoryMovementPayload["type"];
  quantity: number;
  unitRate: number | null;
  reason: SaveInventoryMovementPayload["reason"];
  remark: string | null;
  sourceModule: string | null;
  sourceRemoteId: string | null;
  sourceLineRemoteId: string | null;
  sourceAction: string | null;
  movementAt: number;
};

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const assertKnownMovementType = (
  type: SaveInventoryMovementPayload["type"],
): void => {
  const allowedTypes = new Set(Object.values(InventoryMovementType));
  if (!allowedTypes.has(type)) {
    throw new Error("Inventory movement type is invalid");
  }
};

export const resolveInventoryDeltaQuantity = (
  movementType: SaveInventoryMovementPayload["type"],
  quantity: number,
): number => {
  if (
    movementType === InventoryMovementType.StockIn ||
    movementType === InventoryMovementType.OpeningStock ||
    movementType === InventoryMovementType.Adjustment
  ) {
    return quantity;
  }

  if (movementType === InventoryMovementType.SaleOut) {
    return quantity * -1;
  }

  throw new Error("Inventory movement type is invalid");
};

const normalizeInventoryMovementPayload = (
  payload: SaveInventoryMovementPayload,
): ValidatedInventoryMovementPayload => {
  const normalizedRemoteId = normalizeRequired(payload.remoteId);
  const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
  const normalizedProductRemoteId = normalizeRequired(payload.productRemoteId);
  const normalizedSourceModule = normalizeOptional(payload.sourceModule);
  const normalizedSourceRemoteId = normalizeOptional(payload.sourceRemoteId);
  const normalizedSourceLineRemoteId = normalizeOptional(payload.sourceLineRemoteId);
  const normalizedSourceAction = normalizeOptional(payload.sourceAction);
  const normalizedRemark = normalizeOptional(payload.remark);

  if (!normalizedRemoteId) {
    throw new Error("Inventory movement remote id is required");
  }

  if (!normalizedAccountRemoteId) {
    throw new Error("Account remote id is required");
  }

  if (!normalizedProductRemoteId) {
    throw new Error("Product remote id is required");
  }

  assertKnownMovementType(payload.type);

  if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) {
    throw new Error("Inventory movement quantity must be greater than zero");
  }

  if (!Number.isFinite(payload.movementAt) || payload.movementAt <= 0) {
    throw new Error("Movement timestamp is required");
  }

  if (normalizedSourceModule && !normalizedSourceRemoteId) {
    throw new Error("Inventory movement source remote id is required");
  }

  if (
    !normalizedSourceModule &&
    (normalizedSourceRemoteId !== null ||
      normalizedSourceLineRemoteId !== null ||
      normalizedSourceAction !== null)
  ) {
    throw new Error("Inventory movement source module is required");
  }

  if (
    payload.unitRate !== null &&
    (!Number.isFinite(payload.unitRate) || payload.unitRate < 0)
  ) {
    throw new Error("Inventory unit rate cannot be negative");
  }

  return {
    remoteId: normalizedRemoteId,
    accountRemoteId: normalizedAccountRemoteId,
    productRemoteId: normalizedProductRemoteId,
    type: payload.type,
    quantity: payload.quantity,
    unitRate: payload.unitRate,
    reason: payload.reason,
    remark: normalizedRemark,
    sourceModule: normalizedSourceModule,
    sourceRemoteId: normalizedSourceRemoteId,
    sourceLineRemoteId: normalizedSourceLineRemoteId,
    sourceAction: normalizedSourceAction,
    movementAt: payload.movementAt,
  };
};

export const validateInventoryMovementPayloadsForSave = (params: {
  payloads: readonly SaveInventoryMovementPayload[];
  products: readonly Product[];
}): ValidatedInventoryMovementPayload[] => {
  if (params.payloads.length === 0) {
    throw new Error("At least one inventory movement payload is required");
  }

  const normalizedPayloads = params.payloads.map(normalizeInventoryMovementPayload);
  const batchAccountRemoteId = normalizedPayloads[0].accountRemoteId;
  const movementRemoteIds = new Set<string>();
  const productByRemoteId = new Map(
    params.products.map((product) => [product.remoteId, product]),
  );
  const nextStockByProductRemoteId = new Map<string, number>();

  for (const payload of normalizedPayloads) {
    if (payload.accountRemoteId !== batchAccountRemoteId) {
      throw new Error(
        "All inventory movement payloads in one save operation must belong to the same account",
      );
    }

    if (movementRemoteIds.has(payload.remoteId)) {
      throw new Error("Duplicate inventory movement remote id in batch");
    }
    movementRemoteIds.add(payload.remoteId);

    const product = productByRemoteId.get(payload.productRemoteId);
    if (!product) {
      throw new Error(`Product with remote id ${payload.productRemoteId} not found`);
    }

    if (product.accountRemoteId !== payload.accountRemoteId) {
      throw new Error("Product does not belong to the selected account");
    }

    if (product.kind !== ProductKind.Item) {
      throw new Error("Inventory movement can only be recorded for item products");
    }

    const currentStock =
      nextStockByProductRemoteId.get(product.remoteId) ??
      (product.stockQuantity ?? 0);

    const deltaQuantity = resolveInventoryDeltaQuantity(
      payload.type,
      payload.quantity,
    );
    const nextStock = currentStock + deltaQuantity;

    if (nextStock < 0) {
      throw new Error(`Inventory movement would reduce ${product.name} below zero`);
    }

    nextStockByProductRemoteId.set(product.remoteId, nextStock);
  }

  return normalizedPayloads;
};
