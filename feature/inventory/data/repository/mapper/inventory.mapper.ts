import { InventoryMovementModel } from "@/feature/inventory/data/dataSource/db/inventoryMovement.model";
import {
    InventoryMovement,
    InventoryStockItem,
} from "@/feature/inventory/types/inventory.types";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";

export const mapProductModelToInventoryStockItem = (
  model: ProductModel,
): InventoryStockItem => {
  const stockQuantity = model.stockQuantity ?? 0;
  const unitValue = model.costPrice ?? model.salePrice;

  return {
    productRemoteId: model.remoteId,
    accountRemoteId: model.accountRemoteId,
    name: model.name,
    categoryName: model.categoryName,
    skuOrBarcode: model.skuOrBarcode,
    stockQuantity,
    unitLabel: model.unitLabel,
    costPrice: model.costPrice,
    stockValue: stockQuantity * unitValue,
    isLowStock: stockQuantity <= 5,
  };
};

export const mapInventoryMovementModelToDomain = (
  model: InventoryMovementModel,
): InventoryMovement => ({
  remoteId: model.remoteId,
  accountRemoteId: model.accountRemoteId,
  productRemoteId: model.productRemoteId,
  productName: model.productNameSnapshot,
  productUnitLabel: model.productUnitLabelSnapshot,
  type: model.movementType,
  quantity: model.quantity,
  deltaQuantity: model.deltaQuantity,
  unitRate: model.unitRate,
  totalValue: model.unitRate === null ? null : model.unitRate * model.quantity,
  reason: model.reason,
  remark: model.remark,
  sourceModule: model.sourceModule,
  sourceRemoteId: model.sourceRemoteId,
  sourceLineRemoteId: model.sourceLineRemoteId,
  sourceAction: model.sourceAction,
  movementAt: model.movementAt,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});
