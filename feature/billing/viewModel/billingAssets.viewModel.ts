import { SaveBillPhotoUseCase } from "@/feature/billing/useCase/saveBillPhoto.useCase";
import { BillingDocumentFormState } from "./billing.viewModel";
import { BillingDraftTotals } from "./billingViewModel.shared";

export type UseBillingAssetsViewModelParams = {
  canManage: boolean;
  accountRemoteId: string | null;
  currencyCode: string;
  countryCode: string | null;
  editorForm: BillingDocumentFormState;
  draftTotals: BillingDraftTotals;
  saveBillPhotoUseCase: SaveBillPhotoUseCase;
  onRefresh: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
};

export type BillingAssetsViewModelModule = {
  onPrintPreview: () => Promise<void>;
  onUploadBillPhoto: () => Promise<void>;
};
