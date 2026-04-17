import { useMemo } from "react";
import { POS_SCREEN_TITLE } from "../types/pos.constant";
import {
  usePosScreenEngine,
  type UsePosScreenEngineParams,
} from "./internal/posScreen.engine.impl";
import { usePosCartViewModel } from "./posCart.viewModel.impl";
import { usePosCatalogViewModel } from "./posCatalog.viewModel.impl";
import { usePosCheckoutViewModel } from "./posCheckout.viewModel.impl";
import { usePosCustomerViewModel } from "./posCustomer.viewModel.impl";
import { usePosReceiptViewModel } from "./posReceipt.viewModel.impl";
import type { PosScreenCoordinatorViewModel } from "./posScreenCoordinator.viewModel";
import { usePosSplitBillViewModel } from "./posSplitBill.viewModel.impl";
import type { PosSaleHistoryViewModel } from "./posSaleHistory.viewModel";

export interface UsePosScreenCoordinatorViewModelParams
  extends UsePosScreenEngineParams {
  saleHistoryViewModel?: PosSaleHistoryViewModel | null;
}

export function usePosScreenCoordinatorViewModel(
  params: UsePosScreenCoordinatorViewModelParams,
): PosScreenCoordinatorViewModel {
  const { saleHistoryViewModel = null, ...engineParams } = params;

  const engine = usePosScreenEngine(engineParams);

  const catalog = usePosCatalogViewModel({ engine });
  const cart = usePosCartViewModel({ engine });
  const customer = usePosCustomerViewModel({ engine });
  const checkout = usePosCheckoutViewModel({ engine });
  const splitBill = usePosSplitBillViewModel({ engine });
  const receipt = usePosReceiptViewModel({ engine });

  return useMemo(
    () => ({
      status: engine.status,
      screenTitle: POS_SCREEN_TITLE,
      currencyCode: engine.currencyCode,
      countryCode: engine.countryCode,
      taxSummaryLabel: engine.taxSummaryLabel,
      infoMessage: engine.infoMessage,
      errorMessage: engine.errorMessage,
      isBusinessContextResolved: engine.isBusinessContextResolved,
      isCheckoutSubmitting: engine.isCheckoutSubmitting,
      load: engine.load,
      catalog,
      cart,
      customer,
      checkout,
      splitBill,
      receipt,
      saleHistory: saleHistoryViewModel,
    }),
    [
      catalog,
      cart,
      checkout,
      customer,
      engine.countryCode,
      engine.currencyCode,
      engine.errorMessage,
      engine.infoMessage,
      engine.isBusinessContextResolved,
      engine.isCheckoutSubmitting,
      engine.load,
      engine.status,
      engine.taxSummaryLabel,
      receipt,
      saleHistoryViewModel,
      splitBill,
    ],
  );
}
