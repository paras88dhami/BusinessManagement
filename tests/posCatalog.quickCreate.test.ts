/** @vitest-environment jsdom */

import { ProductKind, ProductStatus } from "@/feature/products/types/product.types";
import type { PosCatalogViewModel } from "@/feature/pos/viewModel/posCatalog.viewModel";
import { usePosCatalogViewModel } from "@/feature/pos/viewModel/posCatalog.viewModel.impl";
import {
  INITIAL_POS_SCREEN_COORDINATOR_STATE,
  type PosSessionStateOverrides,
} from "@/feature/pos/viewModel/internal/posScreen.shared";
import type { PosScreenCoordinatorState } from "@/feature/pos/types/pos.state.types";
import React, { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

type HookHarnessProps = {
  onReady: (viewModel: PosCatalogViewModel) => void;
  searchPosProductsUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  addProductToCartUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  saveProductUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  createProductWithOpeningStockUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  saveCurrentSession: (
    overrides?: PosSessionStateOverrides,
  ) => Promise<void>;
};

function HookHarness({
  onReady,
  searchPosProductsUseCase,
  addProductToCartUseCase,
  saveProductUseCase,
  createProductWithOpeningStockUseCase,
  saveCurrentSession,
}: HookHarnessProps) {
  const [state, setState] = useState<PosScreenCoordinatorState>({
    ...INITIAL_POS_SCREEN_COORDINATOR_STATE,
    activeModal: "create-product",
    products: [],
    filteredProducts: [],
    recentProducts: [],
    discountInput: "",
    surchargeInput: "",
    productSearchTerm: "",
  });

  const catalogViewModel = usePosCatalogViewModel({
    state,
    setState,
    activeBusinessAccountRemoteId: "account-1",
    defaultTaxRateLabel: "VAT 13%",
    searchPosProductsUseCase: searchPosProductsUseCase as never,
    addProductToCartUseCase: addProductToCartUseCase as never,
    saveProductUseCase: saveProductUseCase as never,
    createProductWithOpeningStockUseCase:
      createProductWithOpeningStockUseCase as never,
    saveCurrentSession,
  });

  useEffect(() => {
    onReady(catalogViewModel);
  }, [catalogViewModel, onReady]);

  return null;
}

const mountCatalog = async (deps: Omit<HookHarnessProps, "onReady">) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const viewModelRef = { current: null as PosCatalogViewModel | null };

  const viewModelProxy = new Proxy(
    {},
    {
      get: (_target, property) => {
        if (!viewModelRef.current) {
          throw new Error("Catalog view model not initialized");
        }
        return (viewModelRef.current as any)[property];
      },
    },
  ) as PosCatalogViewModel;

  await act(async () => {
    root.render(
      React.createElement(HookHarness, {
        ...deps,
        onReady: (vm: PosCatalogViewModel) => {
          viewModelRef.current = vm;
        },
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return { root, container, viewModel: viewModelProxy };
};

describe("pos quick create flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates service from POS and adds it directly to cart", async () => {
    const saveProductUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "service-1",
          accountRemoteId: "account-1",
          name: "Haircut",
          kind: ProductKind.Service,
          categoryName: "Salon",
          salePrice: 500,
          costPrice: null,
          stockQuantity: null,
          unitLabel: null,
          skuOrBarcode: null,
          taxRateLabel: null,
          description: null,
          imageUrl: null,
          status: ProductStatus.Active,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    };

    const createProductWithOpeningStockUseCase = {
      execute: vi.fn(),
    };

    const addProductToCartUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            lineId: "line-1",
            productId: "service-1",
            productName: "Haircut",
            categoryLabel: "Salon",
            shortCode: "H",
            quantity: 1,
            unitPrice: 500,
            taxRate: 0,
            lineSubtotal: 500,
          },
        ],
      })),
    };

    const searchPosProductsUseCase = {
      execute: vi.fn(async () => []),
    };
    const saveCurrentSession = vi.fn(async () => {});

    const { viewModel, root, container } = await mountCatalog({
      searchPosProductsUseCase,
      addProductToCartUseCase,
      saveProductUseCase,
      createProductWithOpeningStockUseCase,
      saveCurrentSession,
    });

    await act(async () => {
      viewModel.onQuickProductKindInputChange(ProductKind.Service);
      viewModel.onQuickProductNameInputChange("Haircut");
      viewModel.onQuickProductPriceInputChange("500");
      viewModel.onQuickProductCategoryInputChange("Salon");
    });

    await act(async () => {
      await viewModel.onCreateProductFromPos();
    });

    expect(saveProductUseCase.execute).toHaveBeenCalledTimes(1);
    expect(saveProductUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: ProductKind.Service,
        unitLabel: null,
        name: "Haircut",
      }),
    );
    expect(createProductWithOpeningStockUseCase.execute).not.toHaveBeenCalled();
    expect(addProductToCartUseCase.execute).toHaveBeenCalledWith({
      productId: "service-1",
    });

    root.unmount();
    container.remove();
  });

  it("creates item from POS through opening-stock workflow", async () => {
    const saveProductUseCase = {
      execute: vi.fn(),
    };

    const createProductWithOpeningStockUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "item-1",
          accountRemoteId: "account-1",
          name: "Rice",
          kind: ProductKind.Item,
          categoryName: "Groceries",
          salePrice: 100,
          costPrice: null,
          stockQuantity: 5,
          unitLabel: "pcs",
          skuOrBarcode: null,
          taxRateLabel: null,
          description: null,
          imageUrl: null,
          status: ProductStatus.Active,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    };

    const addProductToCartUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            lineId: "line-1",
            productId: "item-1",
            productName: "Rice",
            categoryLabel: "Groceries",
            shortCode: "R",
            quantity: 1,
            unitPrice: 100,
            taxRate: 0,
            lineSubtotal: 100,
          },
        ],
      })),
    };

    const searchPosProductsUseCase = {
      execute: vi.fn(async () => []),
    };
    const saveCurrentSession = vi.fn(async () => {});

    const { viewModel, root, container } = await mountCatalog({
      searchPosProductsUseCase,
      addProductToCartUseCase,
      saveProductUseCase,
      createProductWithOpeningStockUseCase,
      saveCurrentSession,
    });

    await act(async () => {
      viewModel.onQuickProductKindInputChange(ProductKind.Item);
      viewModel.onQuickProductNameInputChange("Rice");
      viewModel.onQuickProductPriceInputChange("100");
      viewModel.onQuickProductCategoryInputChange("Groceries");
      viewModel.onQuickProductOpeningStockInputChange("5");
    });

    await act(async () => {
      await viewModel.onCreateProductFromPos();
    });

    expect(saveProductUseCase.execute).not.toHaveBeenCalled();
    expect(createProductWithOpeningStockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(createProductWithOpeningStockUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        openingStockQuantity: 5,
        product: expect.objectContaining({
          kind: ProductKind.Item,
          name: "Rice",
        }),
      }),
    );
    expect(addProductToCartUseCase.execute).toHaveBeenCalledWith({
      productId: "item-1",
    });

    root.unmount();
    container.remove();
  });
});
