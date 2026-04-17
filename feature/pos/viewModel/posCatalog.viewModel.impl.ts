import { useMemo } from "react";
import type { PosCatalogViewModel } from "./posCatalog.viewModel";
import type { PosScreenEngine } from "./internal/posScreen.engine.impl";

interface UsePosCatalogViewModelParams {
  engine: PosScreenEngine;
}

export function usePosCatalogViewModel({
  engine,
}: UsePosCatalogViewModelParams): PosCatalogViewModel {
  return useMemo(
    () => ({
      products: engine.products,
      filteredProducts: engine.filteredProducts,
      recentProducts: engine.recentProducts,
      productSearchTerm: engine.productSearchTerm,
      quickProductNameInput: engine.quickProductNameInput,
      quickProductPriceInput: engine.quickProductPriceInput,
      quickProductCategoryInput: engine.quickProductCategoryInput,
      isCreateProductModalVisible: engine.activeModal === "create-product",
      onProductSearchChange: engine.onProductSearchChange,
      onAddProductToCart: engine.onAddProductToCart,
      onOpenCreateProductModal: engine.onOpenCreateProductModal,
      onCloseCreateProductModal: engine.onCloseCreateProductModal,
      onQuickProductNameInputChange: engine.onQuickProductNameInputChange,
      onQuickProductPriceInputChange: engine.onQuickProductPriceInputChange,
      onQuickProductCategoryInputChange: engine.onQuickProductCategoryInputChange,
      onCreateProductFromPos: engine.onCreateProductFromPos,
    }),
    [engine],
  );
}
