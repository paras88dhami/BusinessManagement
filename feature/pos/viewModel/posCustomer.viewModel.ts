import type { PosCustomer } from "../types/pos.entity.types";
import type { PosCustomerOption } from "../types/pos.ui.types";

export interface PosCustomerViewModel {
  selectedCustomer: PosCustomer | null;
  customerSearchTerm: string;
  customerOptions: readonly PosCustomerOption[];
  customerCreateForm: {
    fullName: string;
    phone: string;
    address: string;
  };
  isCustomerCreateModalVisible: boolean;
  isCreatingCustomer: boolean;
  onSelectCustomer: (customer: PosCustomer) => void;
  onClearCustomer: () => void;
  onCustomerSearchChange: (searchTerm: string) => void;
  onOpenCustomerCreateModal: () => void;
  onCloseCustomerCreateModal: () => void;
  onCustomerCreateFormChange: (
    field: "fullName" | "phone" | "address",
    value: string,
  ) => void;
  onCreateCustomer: () => Promise<void>;
}
