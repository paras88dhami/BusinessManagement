import type { ProductKindValue } from "@/feature/products/types/product.types";
import type { PosProduct } from "../types/pos.entity.types";
import type { PosQuickProductFieldErrors } from "../types/pos.state.types";

export interface PosCatalogViewModel {
  filteredProducts: readonly PosProduct[];
  recentProducts: readonly PosProduct[];
  productSearchTerm: string;
  quickProductNameInput: string;
  quickProductPriceInput: string;
  quickProductCategoryInput: string;
  quickProductKindInput: ProductKindValue;
  quickProductOpeningStockInput: string;
  quickProductFieldErrors: PosQuickProductFieldErrors;
  isCreateProductModalVisible: boolean;
  onProductSearchChange: (value: string) => Promise<void>;
  onAddProductToCart: (productId: string) => Promise<void>;
  onOpenCreateProductModal: () => void;
  onCloseCreateProductModal: () => void;
  onQuickProductNameInputChange: (value: string) => void;
  onQuickProductPriceInputChange: (value: string) => void;
  onQuickProductCategoryInputChange: (value: string) => void;
  onQuickProductKindInputChange: (value: ProductKindValue) => void;
  onQuickProductOpeningStockInputChange: (value: string) => void;
  onCreateProductFromPos: () => Promise<void>;
}
