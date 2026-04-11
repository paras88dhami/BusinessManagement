import { EmiPlanDetailState } from "@/feature/emiLoans/types/emi.state.types";
import { DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";

export interface EmiPlanDetailViewModel {
  visible: boolean;
  isLoading: boolean;
  isSubmittingPayment: boolean;
  errorMessage: string | null;
  state: EmiPlanDetailState | null;
  settlementAccountOptions: readonly DropdownOption[];
  selectedSettlementAccountRemoteId: string;
  close: () => void;
  open: (remoteId: string) => Promise<void>;
  onChangeSettlementAccountRemoteId: (remoteId: string) => void;
  payInstallment: (installmentRemoteId: string) => Promise<void>;
}
