import { Account } from "../types/accountSelection.types";
import { AccountSelectionLoadViewModel } from "./accountSelection.load.viewModel";
import { AccountSelectionSelectViewModel } from "./accountSelection.select.viewModel";
import { AccountSelectionSubmitViewModel } from "./accountSelection.submit.viewModel";

export interface AccountSelectionViewModel
  extends AccountSelectionLoadViewModel,
    AccountSelectionSelectViewModel,
    AccountSelectionSubmitViewModel {
  accounts: readonly Account[];
  onBackToLogin: () => void;
}
