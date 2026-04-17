import type { StatusType } from "@/shared/types/status.types";
import type { PosCartViewModel } from "./posCart.viewModel";
import type { PosCatalogViewModel } from "./posCatalog.viewModel";
import type { PosCheckoutViewModel } from "./posCheckout.viewModel";
import type { PosCustomerViewModel } from "./posCustomer.viewModel";
import type { PosReceiptViewModel } from "./posReceipt.viewModel";
import type { PosSaleHistoryViewModel } from "./posSaleHistory.viewModel";
import type { PosSplitBillViewModel } from "./posSplitBill.viewModel";

export interface PosScreenCoordinatorViewModel {
  status: StatusType;
  screenTitle: string;
  currencyCode: string;
  countryCode: string | null;
  taxSummaryLabel: string;
  infoMessage: string | null;
  errorMessage: string | null;
  isBusinessContextResolved: boolean;
  isCheckoutSubmitting: boolean;
  load: () => Promise<void>;
  catalog: PosCatalogViewModel;
  cart: PosCartViewModel;
  customer: PosCustomerViewModel;
  checkout: PosCheckoutViewModel;
  splitBill: PosSplitBillViewModel;
  receipt: PosReceiptViewModel;
  saleHistory: PosSaleHistoryViewModel | null;
}
