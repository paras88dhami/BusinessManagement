import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import type { GetContactsUseCase } from "@/feature/contacts/useCase/getContacts.useCase";
import type { GetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import { SaveProductUseCase } from "@/feature/products/useCase/saveProduct.useCase";
import { TaxModeValue } from "@/shared/types/regionalFinance.types";
import { Status } from "@/shared/types/status.types";
import {
  buildTaxRateLabel,
  buildTaxSummaryLabel,
  resolveRegionalFinancePolicy,
} from "@/shared/utils/finance/regionalFinancePolicy";
import { useCallback, useEffect, useMemo, useState } from "react";
import { POS_SCREEN_TITLE } from "../types/pos.constant";
import type { PosScreenCoordinatorState } from "../types/pos.state.types";
import { AddProductToCartUseCase } from "../useCase/addProductToCart.useCase";
import { ApplyDiscountUseCase } from "../useCase/applyDiscount.useCase";
import { ApplySurchargeUseCase } from "../useCase/applySurcharge.useCase";
import { ChangeCartLineQuantityUseCase } from "../useCase/changeCartLineQuantity.useCase";
import { ClearCartUseCase } from "../useCase/clearCart.useCase";
import { ClearPosSessionUseCase } from "../useCase/clearPosSession.useCase";
import { CompletePosCheckoutUseCase } from "../useCase/completePosCheckout.useCase";
import { GetPosBootstrapUseCase } from "../useCase/getPosBootstrap.useCase";
import { LoadPosSessionUseCase } from "../useCase/loadPosSession.useCase";
import { PrintPosReceiptUseCase } from "../useCase/printPosReceipt.useCase";
import { SavePosSessionUseCase } from "../useCase/savePosSession.useCase";
import { SearchPosProductsUseCase } from "../useCase/searchPosProducts.useCase";
import { SharePosReceiptUseCase } from "../useCase/sharePosReceipt.useCase";
import { usePosCartViewModel } from "./posCart.viewModel.impl";
import { usePosCatalogViewModel } from "./posCatalog.viewModel.impl";
import {
  usePosCheckoutFlowController,
  usePosCheckoutViewModel,
} from "./posCheckout.viewModel.impl";
import { usePosCustomerViewModel } from "./posCustomer.viewModel.impl";
import {
  buildPosSessionRestoreSnapshot,
  buildPosSessionDataFromState,
  calculateTotals,
  EMPTY_POS_SESSION_RESTORE_SNAPSHOT,
  EMPTY_TOTALS,
  INITIAL_POS_SCREEN_COORDINATOR_STATE,
  mapMoneyAccountToOption,
  parseAmountInput,
  resolveSelectedSettlementAccountRemoteId,
  sanitizeSplitBillDraftPartSettlementAccounts,
  type PosSessionStateOverrides,
} from "./internal/posScreen.shared";
import { usePosReceiptViewModel } from "./posReceipt.viewModel.impl";
import type { PosSaleHistoryViewModel } from "./posSaleHistory.viewModel";
import type { PosScreenCoordinatorViewModel } from "./posScreenCoordinator.viewModel";
import { usePosSplitBillViewModel } from "./posSplitBill.viewModel.impl";

interface UsePosScreenCoordinatorViewModelParams {
  activeBusinessAccountRemoteId: string | null;
  activeOwnerUserRemoteId: string | null;
  activeSettlementAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  activeAccountDefaultTaxRatePercent: number | null;
  activeAccountDefaultTaxMode: TaxModeValue | null;
  getPosBootstrapUseCase: GetPosBootstrapUseCase;
  searchPosProductsUseCase: SearchPosProductsUseCase;
  addProductToCartUseCase: AddProductToCartUseCase;
  changeCartLineQuantityUseCase: ChangeCartLineQuantityUseCase;
  applyDiscountUseCase: ApplyDiscountUseCase;
  applySurchargeUseCase: ApplySurchargeUseCase;
  getOrCreateBusinessContactUseCase: GetOrCreateBusinessContactUseCase;
  getContactsUseCase: GetContactsUseCase;
  clearCartUseCase: ClearCartUseCase;
  completePosCheckoutUseCase: CompletePosCheckoutUseCase;
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  printPosReceiptUseCase: PrintPosReceiptUseCase;
  sharePosReceiptUseCase: SharePosReceiptUseCase;
  saveProductUseCase: SaveProductUseCase;
  savePosSessionUseCase: SavePosSessionUseCase;
  loadPosSessionUseCase: LoadPosSessionUseCase;
  clearPosSessionUseCase: ClearPosSessionUseCase;
  saleHistoryViewModel?: PosSaleHistoryViewModel | null;
}

export function usePosScreenCoordinatorViewModel(
  params: UsePosScreenCoordinatorViewModelParams,
): PosScreenCoordinatorViewModel {
  const {
    activeBusinessAccountRemoteId,
    activeOwnerUserRemoteId,
    activeSettlementAccountRemoteId,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
    activeAccountDefaultTaxRatePercent,
    activeAccountDefaultTaxMode,
    getPosBootstrapUseCase,
    searchPosProductsUseCase,
    addProductToCartUseCase,
    changeCartLineQuantityUseCase,
    applyDiscountUseCase,
    applySurchargeUseCase,
    getOrCreateBusinessContactUseCase,
    getContactsUseCase,
    clearCartUseCase,
    completePosCheckoutUseCase,
    getMoneyAccountsUseCase,
    printPosReceiptUseCase,
    sharePosReceiptUseCase,
    saveProductUseCase,
    savePosSessionUseCase,
    loadPosSessionUseCase,
    clearPosSessionUseCase,
    saleHistoryViewModel = null,
  } = params;

  const regionalFinancePolicy = useMemo(
    () =>
      resolveRegionalFinancePolicy({
        countryCode: activeAccountCountryCode,
        currencyCode: activeAccountCurrencyCode,
        defaultTaxRatePercent: activeAccountDefaultTaxRatePercent,
        defaultTaxMode: activeAccountDefaultTaxMode,
      }),
    [
      activeAccountCountryCode,
      activeAccountCurrencyCode,
      activeAccountDefaultTaxMode,
      activeAccountDefaultTaxRatePercent,
    ],
  );

  const defaultTaxRateLabel = useMemo(
    () => buildTaxRateLabel(regionalFinancePolicy.defaultTaxRatePercent),
    [regionalFinancePolicy.defaultTaxRatePercent],
  );

  const taxSummaryLabel = useMemo(
    () =>
      buildTaxSummaryLabel({
        taxLabel: regionalFinancePolicy.taxLabel,
        taxRatePercent: regionalFinancePolicy.defaultTaxRatePercent,
      }),
    [
      regionalFinancePolicy.defaultTaxRatePercent,
      regionalFinancePolicy.taxLabel,
    ],
  );

  const currencyCode = useMemo(
    () => regionalFinancePolicy.currencyCode,
    [regionalFinancePolicy.currencyCode],
  );

  const [state, setState] = useState<PosScreenCoordinatorState>(
    INITIAL_POS_SCREEN_COORDINATOR_STATE,
  );

  const saveCurrentSession = useCallback(
    async (overrides: PosSessionStateOverrides = {}) => {
      if (!activeBusinessAccountRemoteId) {
        return;
      }

      await savePosSessionUseCase.execute({
        businessAccountRemoteId: activeBusinessAccountRemoteId,
        sessionData: buildPosSessionDataFromState(state, overrides),
      });
    },
    [activeBusinessAccountRemoteId, savePosSessionUseCase, state],
  );

  const load = useCallback(async () => {
    setState((currentState) => ({
      ...currentState,
      status: Status.Loading,
      errorMessage: null,
      infoMessage: null,
    }));

    const result = await getPosBootstrapUseCase.execute({
      activeBusinessAccountRemoteId,
      activeOwnerUserRemoteId,
      activeSettlementAccountRemoteId,
    });
    if (!result.success) {
      setState((currentState) => ({
        ...currentState,
        status: Status.Failure,
        bootstrap: null,
        cartLines: [],
        totals: EMPTY_TOTALS,
        errorMessage: result.error.message,
      }));
      return;
    }

    let moneyAccountOptions: import("../types/pos.ui.types").PosMoneyAccountOption[] = [];
    if (activeBusinessAccountRemoteId) {
      const moneyAccountsResult = await getMoneyAccountsUseCase.execute(
        activeBusinessAccountRemoteId,
      );
      if (moneyAccountsResult.success) {
        moneyAccountOptions = moneyAccountsResult.value.map(
          mapMoneyAccountToOption,
        );
      }
    }

    let sessionSnapshot = EMPTY_POS_SESSION_RESTORE_SNAPSHOT;

    if (activeBusinessAccountRemoteId) {
      const sessionResult = await loadPosSessionUseCase.execute({
        businessAccountRemoteId: activeBusinessAccountRemoteId,
      });

      if (sessionResult.success && sessionResult.value) {
        sessionSnapshot = buildPosSessionRestoreSnapshot(sessionResult.value);
      }
    }

    const selectedSettlementAccountRemoteId =
      resolveSelectedSettlementAccountRemoteId({
        moneyAccountOptions,
        sessionSelectedSettlementAccountRemoteId:
          sessionSnapshot.selectedSettlementAccountRemoteId,
        activeSettlementAccountRemoteId,
      });

    const sanitizedSplitBillDraftParts =
      sanitizeSplitBillDraftPartSettlementAccounts({
        splitBillDraftParts: sessionSnapshot.splitBillDraftParts,
        moneyAccountOptions,
        fallbackSettlementAccountRemoteId: selectedSettlementAccountRemoteId,
      });

    const restoredFilteredProducts =
      sessionSnapshot.didRestoreSession &&
      sessionSnapshot.productSearchTerm.trim().length > 0
        ? await searchPosProductsUseCase.execute(
            sessionSnapshot.productSearchTerm,
          )
        : [];

    const restoredTotals = sessionSnapshot.didRestoreSession
      ? calculateTotals(
          sessionSnapshot.cartLines,
          parseAmountInput(sessionSnapshot.discountInput),
          parseAmountInput(sessionSnapshot.surchargeInput),
        )
      : EMPTY_TOTALS;

    setState((currentState) => ({
      ...currentState,
      status: Status.Success,
      bootstrap: result.value,
      products: result.value.products,
      filteredProducts: restoredFilteredProducts,
      cartLines: sessionSnapshot.didRestoreSession ? sessionSnapshot.cartLines : [],
      recentProducts: sessionSnapshot.didRestoreSession
        ? sessionSnapshot.recentProducts
        : [],
      productSearchTerm: sessionSnapshot.didRestoreSession
        ? sessionSnapshot.productSearchTerm
        : "",
      selectedCustomer: sessionSnapshot.didRestoreSession
        ? sessionSnapshot.selectedCustomer
        : null,
      selectedSettlementAccountRemoteId,
      moneyAccountOptions,
      discountInput: sessionSnapshot.didRestoreSession
        ? sessionSnapshot.discountInput
        : "",
      surchargeInput: sessionSnapshot.didRestoreSession
        ? sessionSnapshot.surchargeInput
        : "",
      splitBillDraftParts: sessionSnapshot.didRestoreSession
        ? sanitizedSplitBillDraftParts
        : [],
      totals: restoredTotals,
      errorMessage: null,
    }));
  }, [
    activeBusinessAccountRemoteId,
    activeOwnerUserRemoteId,
    activeSettlementAccountRemoteId,
    getMoneyAccountsUseCase,
    getPosBootstrapUseCase,
    loadPosSessionUseCase,
    searchPosProductsUseCase,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const checkoutFlow = usePosCheckoutFlowController({
    state,
    setState,
    activeBusinessAccountRemoteId,
    activeOwnerUserRemoteId,
    currencyCode,
    countryCode: regionalFinancePolicy.countryCode,
    completePosCheckoutUseCase,
    clearPosSessionUseCase,
  });

  const catalog = usePosCatalogViewModel({
    state,
    setState,
    activeBusinessAccountRemoteId,
    defaultTaxRateLabel,
    searchPosProductsUseCase,
    addProductToCartUseCase,
    saveProductUseCase,
    saveCurrentSession,
  });

  const cart = usePosCartViewModel({
    state,
    setState,
    activeBusinessAccountRemoteId,
    changeCartLineQuantityUseCase,
    applyDiscountUseCase,
    applySurchargeUseCase,
    clearCartUseCase,
    clearPosSessionUseCase,
    saveCurrentSession,
  });

  const customer = usePosCustomerViewModel({
    state,
    setState,
    activeBusinessAccountRemoteId,
    activeOwnerUserRemoteId,
    getContactsUseCase,
    getOrCreateBusinessContactUseCase,
    saveCurrentSession,
  });

  const checkout = usePosCheckoutViewModel({
    state,
    setState,
    saveCurrentSession,
    submitCheckout: checkoutFlow.submitCheckout,
  });

  const splitBill = usePosSplitBillViewModel({
    state,
    setState,
    saveCurrentSession,
    submitCheckout: checkoutFlow.submitCheckout,
  });

  const receipt = usePosReceiptViewModel({
    state,
    setState,
    currencyCode,
    countryCode: regionalFinancePolicy.countryCode,
    printPosReceiptUseCase,
    sharePosReceiptUseCase,
  });

  return useMemo(
    () => ({
      status: state.status,
      screenTitle: POS_SCREEN_TITLE,
      currencyCode,
      countryCode: regionalFinancePolicy.countryCode,
      taxSummaryLabel,
      infoMessage: state.infoMessage,
      errorMessage: state.errorMessage,
      isBusinessContextResolved:
        Boolean(activeBusinessAccountRemoteId) &&
        Boolean(activeOwnerUserRemoteId) &&
        Boolean(activeSettlementAccountRemoteId),
      isCheckoutSubmitting: state.isCheckoutSubmitting,
      load,
      catalog,
      cart,
      customer,
      checkout,
      splitBill,
      receipt,
      saleHistory: saleHistoryViewModel,
    }),
    [
      activeBusinessAccountRemoteId,
      activeOwnerUserRemoteId,
      activeSettlementAccountRemoteId,
      cart,
      catalog,
      checkout,
      currencyCode,
      customer,
      load,
      receipt,
      regionalFinancePolicy.countryCode,
      saleHistoryViewModel,
      splitBill,
      state.errorMessage,
      state.infoMessage,
      state.isCheckoutSubmitting,
      state.status,
      taxSummaryLabel,
    ],
  );
}
