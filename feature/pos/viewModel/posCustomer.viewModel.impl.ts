import { useMemo } from "react";
import type { PosCustomerViewModel } from "./posCustomer.viewModel";
import type { PosScreenEngine } from "./internal/posScreen.engine.impl";

interface UsePosCustomerViewModelParams {
  engine: PosScreenEngine;
}

export function usePosCustomerViewModel({
  engine,
}: UsePosCustomerViewModelParams): PosCustomerViewModel {
  return useMemo(
    () => ({
      selectedCustomer: engine.selectedCustomer,
      customerSearchTerm: engine.customerSearchTerm,
      customerOptions: engine.customerOptions,
      customerCreateForm: engine.customerCreateForm,
      isCustomerCreateModalVisible: engine.activeModal === "customer-create",
      isCreatingCustomer: engine.isCreatingCustomer,
      onSelectCustomer: engine.onSelectCustomer,
      onClearCustomer: engine.onClearCustomer,
      onCustomerSearchChange: engine.onCustomerSearchChange,
      onOpenCustomerCreateModal: engine.onOpenCustomerCreateModal,
      onCloseCustomerCreateModal: engine.onCloseCustomerCreateModal,
      onCustomerCreateFormChange: engine.onCustomerCreateFormChange,
      onCreateCustomer: engine.onCreateCustomer,
    }),
    [engine],
  );
}
