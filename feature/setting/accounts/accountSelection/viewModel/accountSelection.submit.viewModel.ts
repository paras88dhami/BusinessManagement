export interface AccountSelectionSubmitViewModel {
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
  onConfirmSelection: () => Promise<void>;
}
