import { ProductModel } from "./product.model";
import { productsTable } from "./product.schema";

export const productDbConfig = {
  models: [ProductModel],
  tables: [productsTable],
};
