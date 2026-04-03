import { createLocalProductDatasource } from "@/feature/products/data/dataSource/local.product.datasource.impl";
import { createProductRepository } from "@/feature/products/data/repository/product.repository.impl";
import { ProductsScreen } from "@/feature/products/ui/ProductsScreen";
import { createDeleteProductUseCase } from "@/feature/products/useCase/deleteProduct.useCase.impl";
import { createGetProductsUseCase } from "@/feature/products/useCase/getProducts.useCase.impl";
import { createSaveProductUseCase } from "@/feature/products/useCase/saveProduct.useCase.impl";
import { useProductsViewModel } from "@/feature/products/viewModel/products.viewModel.impl";
import { Database } from "@nozbe/watermelondb";
import React from "react";

type Props = {
  database: Database;
  activeAccountRemoteId: string | null;
  canManage: boolean;
};

export function GetProductsScreenFactory({
  database,
  activeAccountRemoteId,
  canManage,
}: Props) {
  const datasource = createLocalProductDatasource(database);
  const repository = createProductRepository(datasource);
  const getProductsUseCase = createGetProductsUseCase(repository);
  const saveProductUseCase = createSaveProductUseCase(repository);
  const deleteProductUseCase = createDeleteProductUseCase(repository);

  const viewModel = useProductsViewModel({
    accountRemoteId: activeAccountRemoteId,
    canManage,
    getProductsUseCase,
    saveProductUseCase,
    deleteProductUseCase,
  });

  return <ProductsScreen viewModel={viewModel} />;
}

