import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { Product } from "@/feature/products/types/product.types";

export const mapProductModelToDomain = (model: ProductModel): Product => ({
  remoteId: model.remoteId,
  accountRemoteId: model.accountRemoteId,
  name: model.name,
  kind: model.kind,
  categoryName: model.categoryName,
  salePrice: model.salePrice,
  costPrice: model.costPrice,
  stockQuantity: model.stockQuantity,
  unitLabel: model.unitLabel,
  skuOrBarcode: model.skuOrBarcode,
  taxRateLabel: model.taxRateLabel,
  description: model.description,
  imageUrl: model.imageUrl,
  status: model.status,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});

