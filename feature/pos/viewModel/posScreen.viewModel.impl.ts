import { useMemo } from "react";
import {
  usePosScreenCoordinatorViewModel,
  type UsePosScreenCoordinatorViewModelParams,
} from "./posScreenCoordinator.viewModel.impl";

export interface UsePosScreenViewModelParams
  extends UsePosScreenCoordinatorViewModelParams {}

export function usePosScreenViewModel(params: UsePosScreenViewModelParams) {
  const coordinator = usePosScreenCoordinatorViewModel(params);

  return useMemo(
    () => ({
      status: coordinator.status,
      screenTitle: coordinator.screenTitle,
      currencyCode: coordinator.currencyCode,
      countryCode: coordinator.countryCode,
      taxSummaryLabel: coordinator.taxSummaryLabel,
      cartLines: coordinator.cart.cartLines,
      totals: coordinator.cart.totals,
      products: coordinator.catalog.products,
      filteredProducts: coordinator.catalog.filteredProducts,
      recentProducts: coordinator.catalog.recentProducts,
      activeModal: coordinator.catalog.isCreateProductModalVisible
        ? "create-product"
        : coordinator.cart.isDiscountModalVisible
          ? "discount"
          : coordinator.cart.isSurchargeModalVisible
            ? "surcharge"
            : coordinator.checkout.isPaymentModalVisible
              ? "payment"
              : coordinator.splitBill.isSplitBillModalVisible
                ? "split-bill"
                : coordinator.receipt.isReceiptModalVisible
                  ? "receipt"
                  : coordinator.customer.isCustomerCreateModalVisible
                    ? "customer-create"
                    : "none",
      productSearchTerm: coordinator.catalog.productSearchTerm,
      discountInput: coordinator.cart.discountInput,
      surchargeInput: coordinator.cart.surchargeInput,
      paymentInput: coordinator.checkout.paymentInput,
      quickProductNameInput: coordinator.catalog.quickProductNameInput,
      quickProductPriceInput: coordinator.catalog.quickProductPriceInput,
      quickProductCategoryInput: coordinator.catalog.quickProductCategoryInput,
      receipt: coordinator.receipt.receipt,
      infoMessage: coordinator.infoMessage,
      errorMessage: coordinator.errorMessage,
      selectedCustomer: coordinator.customer.selectedCustomer,
      customerSearchTerm: coordinator.customer.customerSearchTerm,
      customerCreateForm: coordinator.customer.customerCreateForm,
      selectedSettlementAccountRemoteId:
        coordinator.checkout.selectedSettlementAccountRemoteId,
      moneyAccountOptions: coordinator.checkout.moneyAccountOptions,
      isBusinessContextResolved: coordinator.isBusinessContextResolved,
      load: coordinator.load,
      onProductSearchChange: coordinator.catalog.onProductSearchChange,
      onAddProductToCart: coordinator.catalog.onAddProductToCart,
      onOpenCreateProductModal: coordinator.catalog.onOpenCreateProductModal,
      onCloseCreateProductModal: coordinator.catalog.onCloseCreateProductModal,
      onQuickProductNameInputChange:
        coordinator.catalog.onQuickProductNameInputChange,
      onQuickProductPriceInputChange:
        coordinator.catalog.onQuickProductPriceInputChange,
      onQuickProductCategoryInputChange:
        coordinator.catalog.onQuickProductCategoryInputChange,
      onCreateProductFromPos: coordinator.catalog.onCreateProductFromPos,
      onCloseModal: coordinator.cart.onCloseAdjustmentModal,
      onIncreaseQuantity: coordinator.cart.onIncreaseQuantity,
      onDecreaseQuantity: coordinator.cart.onDecreaseQuantity,
      onRemoveCartLine: coordinator.cart.onRemoveCartLine,
      onDiscountInputChange: coordinator.cart.onDiscountInputChange,
      onSurchargeInputChange: coordinator.cart.onSurchargeInputChange,
      onPaymentInputChange: coordinator.checkout.onPaymentInputChange,
      onOpenDiscountModal: coordinator.cart.onOpenDiscountModal,
      onOpenSurchargeModal: coordinator.cart.onOpenSurchargeModal,
      onOpenPaymentModal: coordinator.checkout.onOpenPaymentModal,
      onClosePaymentModal: coordinator.checkout.onClosePaymentModal,
      onConfirmPayment: coordinator.checkout.onConfirmPayment,
      onOpenSplitBillModal: coordinator.splitBill.onOpenSplitBillModal,
      onCloseSplitBillModal: coordinator.splitBill.onCloseSplitBillModal,
      onApplyEqualSplit: coordinator.splitBill.onApplyEqualSplit,
      onAddSplitBillPart: coordinator.splitBill.onAddSplitBillPart,
      onRemoveSplitBillPart: coordinator.splitBill.onRemoveSplitBillPart,
      onChangeSplitBillPartAmount:
        coordinator.splitBill.onChangeSplitBillPartAmount,
      onChangeSplitBillPartPayerLabel:
        coordinator.splitBill.onChangeSplitBillPartPayerLabel,
      onChangeSplitBillPartSettlementAccount:
        coordinator.splitBill.onChangeSplitBillPartSettlementAccount,
      onCompleteSplitBillPayment:
        coordinator.splitBill.onCompleteSplitBillPayment,
      onOpenReceiptModal: coordinator.receipt.onOpenReceiptModal,
      onCloseReceiptModal: coordinator.receipt.onCloseReceiptModal,
      onPrintReceipt: coordinator.receipt.onPrintReceipt,
      onShareReceipt: coordinator.receipt.onShareReceipt,
      onSelectCustomer: coordinator.customer.onSelectCustomer,
      onClearCustomer: coordinator.customer.onClearCustomer,
      onCustomerSearchChange: coordinator.customer.onCustomerSearchChange,
      onOpenCustomerCreateModal: coordinator.customer.onOpenCustomerCreateModal,
      onCloseCustomerCreateModal:
        coordinator.customer.onCloseCustomerCreateModal,
      onCustomerCreateFormChange: coordinator.customer.onCustomerCreateFormChange,
      onCreateCustomer: coordinator.customer.onCreateCustomer,
      onSettlementAccountChange: coordinator.checkout.onSettlementAccountChange,
      onApplyDiscount: coordinator.cart.onApplyDiscount,
      onApplySurcharge: coordinator.cart.onApplySurcharge,
      onClearCart: coordinator.cart.onClearCart,
      customerOptions: coordinator.customer.customerOptions,
      isCreatingCustomer: coordinator.customer.isCreatingCustomer,
      splitBillDraftParts: coordinator.splitBill.splitBillDraftParts,
      splitBillAllocatedAmount: coordinator.splitBill.splitBillAllocatedAmount,
      splitBillRemainingAmount: coordinator.splitBill.splitBillRemainingAmount,
      splitBillErrorMessage: coordinator.splitBill.splitBillErrorMessage,
      isCheckoutSubmitting: coordinator.isCheckoutSubmitting,
      isPaymentSubmitting: coordinator.checkout.isPaymentSubmitting,
      isSplitBillSubmitting: coordinator.splitBill.isSplitBillSubmitting,
    }),
    [coordinator],
  );
}
