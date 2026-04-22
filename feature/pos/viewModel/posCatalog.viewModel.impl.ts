import {
  CreateProductWithOpeningStockUseCase,
} from "@/feature/products/useCase/createProductWithOpeningStock.useCase";
import {
  ProductKind,
  ProductStatus,
} from "@/feature/products/types/product.types";
import { validatePosQuickProductForm } from "@/feature/pos/validation/validatePosQuickProductForm";
import { SaveProductUseCase } from "@/feature/products/useCase/saveProduct.useCase";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { POS_DEFAULT_QUICK_PRODUCT_PRICE_INPUT } from "../types/pos.constant";
import type { PosProduct } from "../types/pos.entity.types";
import type {
  PosQuickProductFieldErrors,
  PosScreenCoordinatorState,
} from "../types/pos.state.types";
import { AddProductToCartUseCase } from "../useCase/addProductToCart.useCase";
import { SearchPosProductsUseCase } from "../useCase/searchPosProducts.useCase";
import {
  buildNextRecentProducts,
  calculateTotals,
  parseAmountInput,
  type PosSessionStateOverrides,
} from "./internal/posScreen.shared";
import type { PosCatalogViewModel } from "./posCatalog.viewModel";

interface UsePosCatalogViewModelParams {
  state: PosScreenCoordinatorState;
  setState: React.Dispatch<React.SetStateAction<PosScreenCoordinatorState>>;
  activeBusinessAccountRemoteId: string | null;
  defaultTaxRateLabel: string;
  searchPosProductsUseCase: SearchPosProductsUseCase;
  addProductToCartUseCase: AddProductToCartUseCase;
  saveProductUseCase: SaveProductUseCase;
  createProductWithOpeningStockUseCase: CreateProductWithOpeningStockUseCase;
  saveCurrentSession: (
    overrides?: PosSessionStateOverrides,
  ) => Promise<void>;
}

const clearFieldError = (
  fieldErrors: PosQuickProductFieldErrors,
  field: keyof PosQuickProductFieldErrors,
): PosQuickProductFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

const buildQuickCreatedPosProduct = (params: {
  remoteId: string;
  name: string;
  categoryName: string | null;
  unitLabel: string | null;
  kind: typeof ProductKind.Item | typeof ProductKind.Service;
  salePrice: number;
}): PosProduct => ({
  id: params.remoteId,
  name: params.name,
  categoryLabel: params.categoryName ?? "General",
  unitLabel: params.unitLabel,
  kind: params.kind,
  price: params.salePrice,
  taxRate: 0,
  shortCode: params.name.trim().slice(0, 1).toUpperCase() || "P",
});

export function usePosCatalogViewModel({
  state,
  setState,
  activeBusinessAccountRemoteId,
  defaultTaxRateLabel,
  searchPosProductsUseCase,
  addProductToCartUseCase,
  saveProductUseCase,
  createProductWithOpeningStockUseCase,
  saveCurrentSession,
}: UsePosCatalogViewModelParams): PosCatalogViewModel {
  const productSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productSearchRequestIdRef = useRef(0);

  const onProductSearchChange = useCallback(
    async (value: string) => {
      const normalizedValue = value.trim();
      setState((currentState) => ({
        ...currentState,
        productSearchTerm: value,
        filteredProducts:
          normalizedValue === "" ? [] : currentState.filteredProducts,
        errorMessage: null,
      }));

      if (productSearchDebounceRef.current) {
        clearTimeout(productSearchDebounceRef.current);
      }

      const requestId = ++productSearchRequestIdRef.current;

      productSearchDebounceRef.current = setTimeout(() => {
        void (async () => {
          if (value.trim() === "") {
            await saveCurrentSession({
              productSearchTerm: value,
            });
            return;
          }

          const products = await searchPosProductsUseCase.execute(value);
          if (requestId !== productSearchRequestIdRef.current) {
            return;
          }

          setState((currentState) => ({
            ...currentState,
            filteredProducts: products,
          }));

          await saveCurrentSession({
            productSearchTerm: value,
          });
        })();
      }, 250);
    },
    [saveCurrentSession, searchPosProductsUseCase, setState],
  );

  useEffect(() => {
    return () => {
      if (productSearchDebounceRef.current) {
        clearTimeout(productSearchDebounceRef.current);
      }
    };
  }, []);

  const onAddProductToCart = useCallback(
    async (productId: string) => {
      const product = state.products.find((item) => item.id === productId);
      if (!product) {
        setState((currentState) => ({
          ...currentState,
          errorMessage: "Product not found.",
        }));
        return;
      }

      const result = await addProductToCartUseCase.execute({ productId });
      if (!result.success) {
        setState((currentState) => ({
          ...currentState,
          errorMessage: result.error.message,
        }));
        return;
      }

      const nextRecentProducts = buildNextRecentProducts(
        state.recentProducts,
        product,
      );

      setState((currentState) => ({
        ...currentState,
        cartLines: result.value,
        totals: calculateTotals(
          result.value,
          parseAmountInput(currentState.discountInput),
          parseAmountInput(currentState.surchargeInput),
        ),
        recentProducts: nextRecentProducts,
        errorMessage: null,
      }));

      await saveCurrentSession({
        cartLines: result.value,
        recentProducts: nextRecentProducts,
      });
    },
    [
      addProductToCartUseCase,
      saveCurrentSession,
      setState,
      state.products,
      state.recentProducts,
    ],
  );

  const onOpenCreateProductModal = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      activeModal: "create-product",
      quickProductNameInput: "",
      quickProductPriceInput: POS_DEFAULT_QUICK_PRODUCT_PRICE_INPUT,
      quickProductCategoryInput: "",
      quickProductKindInput: ProductKind.Item,
      quickProductOpeningStockInput: "",
      quickProductFieldErrors: {},
      errorMessage: null,
      infoMessage: null,
    }));
  }, [setState]);

  const onCloseCreateProductModal = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      activeModal: "none",
      quickProductNameInput: "",
      quickProductPriceInput: POS_DEFAULT_QUICK_PRODUCT_PRICE_INPUT,
      quickProductCategoryInput: "",
      quickProductKindInput: ProductKind.Item,
      quickProductOpeningStockInput: "",
      quickProductFieldErrors: {},
      errorMessage: null,
    }));
  }, [setState]);

  const onQuickProductNameInputChange = useCallback(
    (value: string) => {
      setState((currentState) => ({
        ...currentState,
        quickProductNameInput: value,
        quickProductFieldErrors: clearFieldError(
          currentState.quickProductFieldErrors,
          "name",
        ),
        errorMessage: null,
      }));
    },
    [setState],
  );

  const onQuickProductPriceInputChange = useCallback(
    (value: string) => {
      setState((currentState) => ({
        ...currentState,
        quickProductPriceInput: value,
        quickProductFieldErrors: clearFieldError(
          currentState.quickProductFieldErrors,
          "salePrice",
        ),
        errorMessage: null,
      }));
    },
    [setState],
  );

  const onQuickProductCategoryInputChange = useCallback(
    (value: string) => {
      setState((currentState) => ({
        ...currentState,
        quickProductCategoryInput: value,
        errorMessage: null,
      }));
    },
    [setState],
  );

  const onQuickProductKindInputChange = useCallback(
    (value: typeof ProductKind.Item | typeof ProductKind.Service) => {
      setState((currentState) => ({
        ...currentState,
        quickProductKindInput: value,
        quickProductOpeningStockInput:
          value === ProductKind.Service
            ? ""
            : currentState.quickProductOpeningStockInput,
        quickProductFieldErrors: {
          ...currentState.quickProductFieldErrors,
          openingStockQuantity: undefined,
        },
        errorMessage: null,
      }));
    },
    [setState],
  );

  const onQuickProductOpeningStockInputChange = useCallback(
    (value: string) => {
      setState((currentState) => ({
        ...currentState,
        quickProductOpeningStockInput: value,
        quickProductFieldErrors: clearFieldError(
          currentState.quickProductFieldErrors,
          "openingStockQuantity",
        ),
        errorMessage: null,
      }));
    },
    [setState],
  );

  const onCreateProductFromPos = useCallback(async () => {
    const nextFieldErrors = validatePosQuickProductForm({
      name: state.quickProductNameInput,
      salePrice: state.quickProductPriceInput,
      kind: state.quickProductKindInput,
      openingStockQuantity: state.quickProductOpeningStockInput,
    });

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setState((currentState) => ({
        ...currentState,
        quickProductFieldErrors: nextFieldErrors,
        errorMessage: null,
      }));
      return;
    }

    if (!activeBusinessAccountRemoteId) {
      setState((currentState) => ({
        ...currentState,
        errorMessage: "Business context is required for product creation.",
      }));
      return;
    }

    const normalizedName = state.quickProductNameInput.trim();
    const normalizedPrice = state.quickProductPriceInput.trim();
    const normalizedCategoryName = state.quickProductCategoryInput.trim();
    const normalizedOpeningStock =
      state.quickProductOpeningStockInput.trim();
    const parsedPrice = parseAmountInput(normalizedPrice);
    const parsedOpeningStock =
      normalizedOpeningStock.length > 0
        ? Number(normalizedOpeningStock.replace(/,/g, ""))
        : null;

    const remoteId = `product-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    const isItem = state.quickProductKindInput === ProductKind.Item;
    const isService = state.quickProductKindInput === ProductKind.Service;

    const createResult = isItem
      ? await createProductWithOpeningStockUseCase.execute({
          product: {
            remoteId,
            accountRemoteId: activeBusinessAccountRemoteId,
            name: normalizedName,
            kind: ProductKind.Item,
            categoryName: normalizedCategoryName || null,
            salePrice: parsedPrice,
            costPrice: null,
            unitLabel: "pcs",
            skuOrBarcode: null,
            taxRateLabel: defaultTaxRateLabel,
            description: null,
            imageUrl: null,
            status: ProductStatus.Active,
          },
          openingStockQuantity: parsedOpeningStock,
        })
      : await saveProductUseCase.execute({
          remoteId,
          accountRemoteId: activeBusinessAccountRemoteId,
          name: normalizedName,
          kind: ProductKind.Service,
          categoryName: normalizedCategoryName || null,
          salePrice: parsedPrice,
          costPrice: null,
          unitLabel: null,
          skuOrBarcode: null,
          taxRateLabel: defaultTaxRateLabel,
          description: null,
          imageUrl: null,
          status: ProductStatus.Active,
        });

    if (!createResult.success) {
      setState((currentState) => ({
        ...currentState,
        errorMessage: createResult.error.message,
      }));
      return;
    }

    const addResult = await addProductToCartUseCase.execute({
      productId: createResult.value.remoteId,
    });
    if (!addResult.success) {
      setState((currentState) => ({
        ...currentState,
        errorMessage: addResult.error.message,
      }));
      return;
    }

    const refreshedProducts = await searchPosProductsUseCase.execute(
      state.productSearchTerm,
    );

    const createdProduct = buildQuickCreatedPosProduct({
      remoteId: createResult.value.remoteId,
      name: createResult.value.name,
      categoryName: createResult.value.categoryName,
      unitLabel: createResult.value.unitLabel,
      kind: createResult.value.kind,
      salePrice: createResult.value.salePrice,
    });

    const nextRecentProducts = buildNextRecentProducts(
      state.recentProducts,
      createdProduct,
    );

    setState((currentState) => ({
      ...currentState,
      activeModal: "none",
      quickProductNameInput: "",
      quickProductPriceInput: POS_DEFAULT_QUICK_PRODUCT_PRICE_INPUT,
      quickProductCategoryInput: "",
      quickProductKindInput: ProductKind.Item,
      quickProductOpeningStockInput: "",
      quickProductFieldErrors: {},
      products: refreshedProducts,
      filteredProducts: refreshedProducts,
      cartLines: addResult.value,
      totals: calculateTotals(
        addResult.value,
        parseAmountInput(currentState.discountInput),
        parseAmountInput(currentState.surchargeInput),
      ),
      recentProducts: nextRecentProducts,
      errorMessage: null,
      infoMessage: isService
        ? `Service "${normalizedName}" created and added to cart successfully.`
        : `Item "${normalizedName}" created and added to cart successfully.`,
    }));

    await saveCurrentSession({
      cartLines: addResult.value,
      recentProducts: nextRecentProducts,
    });
  }, [
    activeBusinessAccountRemoteId,
    addProductToCartUseCase,
    createProductWithOpeningStockUseCase,
    defaultTaxRateLabel,
    saveCurrentSession,
    saveProductUseCase,
    searchPosProductsUseCase,
    setState,
    state.productSearchTerm,
    state.quickProductCategoryInput,
    state.quickProductKindInput,
    state.quickProductNameInput,
    state.quickProductOpeningStockInput,
    state.quickProductPriceInput,
    state.recentProducts,
  ]);

  return useMemo(
    () => ({
      filteredProducts: state.filteredProducts,
      recentProducts: state.recentProducts,
      productSearchTerm: state.productSearchTerm,
      quickProductNameInput: state.quickProductNameInput,
      quickProductPriceInput: state.quickProductPriceInput,
      quickProductCategoryInput: state.quickProductCategoryInput,
      quickProductKindInput: state.quickProductKindInput,
      quickProductOpeningStockInput: state.quickProductOpeningStockInput,
      quickProductFieldErrors: state.quickProductFieldErrors,
      isCreateProductModalVisible: state.activeModal === "create-product",
      onProductSearchChange,
      onAddProductToCart,
      onOpenCreateProductModal,
      onCloseCreateProductModal,
      onQuickProductNameInputChange,
      onQuickProductPriceInputChange,
      onQuickProductCategoryInputChange,
      onQuickProductKindInputChange,
      onQuickProductOpeningStockInputChange,
      onCreateProductFromPos,
    }),
    [
      onAddProductToCart,
      onCloseCreateProductModal,
      onCreateProductFromPos,
      onOpenCreateProductModal,
      onProductSearchChange,
      onQuickProductCategoryInputChange,
      onQuickProductKindInputChange,
      onQuickProductNameInputChange,
      onQuickProductOpeningStockInputChange,
      onQuickProductPriceInputChange,
      state.activeModal,
      state.filteredProducts,
      state.productSearchTerm,
      state.quickProductCategoryInput,
      state.quickProductFieldErrors,
      state.quickProductKindInput,
      state.quickProductNameInput,
      state.quickProductOpeningStockInput,
      state.quickProductPriceInput,
      state.recentProducts,
    ],
  );
}
